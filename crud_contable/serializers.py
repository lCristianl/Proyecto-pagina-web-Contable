from rest_framework import serializers
from .models import (
    Client, Product, Invoice, InvoiceItem, Expense,
    Supplier, InventoryProduct, InventoryMovement,
    Purchase, PurchaseItem
)
from django.utils import timezone

class ClientSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('user',)
    
    def validate_ruc(self, value):
        return value or "N/A"
    
    def validate(self, data):
        """Validar que la combinación user+cedula sea única"""
        user = self.context['request'].user
        cedula = data.get('cedula')
        
        if cedula:
            # Verificar si ya existe un cliente con la misma cédula para este usuario
            existing_client = Client.objects.filter(user=user, cedula=cedula).first()
            
            # Si estamos editando, excluir el cliente actual de la validación
            if self.instance:
                if existing_client and existing_client.id != self.instance.id:
                    raise serializers.ValidationError({
                        'cedula': 'Ya tienes un cliente registrado con esta cédula.'
                    })
            else:
                if existing_client:
                    raise serializers.ValidationError({
                        'cedula': 'Ya tienes un cliente registrado con esta cédula.'
                    })
        
        return data

class ProductSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    current_stock = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False, default=0)
    minimum_stock = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False, default=0)
    location = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('user',)
    
    def validate(self, data):
        """Validar que la combinación user+code sea única"""
        user = self.context['request'].user
        code = data.get('code')
        
        if code:
            # Verificar si ya existe un producto con el mismo código para este usuario
            existing_product = Product.objects.filter(user=user, code=code).first()
            
            # Si estamos editando, excluir el producto actual de la validación
            if self.instance:
                if existing_product and existing_product.id != self.instance.id:
                    raise serializers.ValidationError({
                        'code': 'Ya tienes un producto registrado con este código.'
                    })
            else:
                if existing_product:
                    raise serializers.ValidationError({
                        'code': 'Ya tienes un producto registrado con este código.'
                    })
        
        return data
    
    def create(self, validated_data):
        # Extract inventory fields
        current_stock = validated_data.pop('current_stock', 0)
        minimum_stock = validated_data.pop('minimum_stock', 0)
        location = validated_data.pop('location', None)
        
        # Create the product
        product = Product.objects.create(**validated_data)
        
        # Create inventory entry for the product
        InventoryProduct.objects.create(
            product=product,
            current_stock=current_stock,
            minimum_stock=minimum_stock,
            location=location,
            last_movement_date=timezone.now() if current_stock > 0 else None
        )
        
        # Create inventory movement record if initial stock > 0
        if current_stock > 0:
            InventoryMovement.objects.create(
                product=product,
                type='increase',
                quantity=current_stock,
                reason='Stock inicial',
                date=timezone.now().date(),
                resulting_stock=current_stock
            )
        
        return product

# Serializer para crear items de factura
class InvoiceItemCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()  # Acepta solo el ID del producto
    
    class Meta:
        model = InvoiceItem
        fields = ['product_id', 'quantity', 'unit_price', 'total']

# Serializer para leer items de factura (con objetos completos)
class InvoiceItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = '__all__'

# Serializer para crear facturas
class InvoiceCreateSerializer(serializers.ModelSerializer):
    client_id = serializers.IntegerField()  # Acepta solo el ID del cliente
    items = InvoiceItemCreateSerializer(many=True)  # Items para crear
    
    class Meta:
        model = Invoice
        fields = ['client_id', 'invoice_number', 'date', 'due_date', 'status', 
                 'subtotal', 'tax', 'total', 'items']
    
    def validate_items(self, items):
        """Validar que no hay productos duplicados y que hay stock suficiente"""
        if not items:
            raise serializers.ValidationError("Debe incluir al menos un producto")
        
        product_ids = []
        user = self.context['request'].user
        
        for item in items:
            product_id = item['product_id']
            quantity = item['quantity']
            
            # Verificar productos duplicados
            if product_id in product_ids:
                raise serializers.ValidationError(f"No se puede agregar el mismo producto más de una vez")
            product_ids.append(product_id)
            
            # Verificar que el producto existe y pertenece al usuario
            try:
                product = Product.objects.get(id=product_id, user=user)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f'Producto {product_id} no encontrado')
            
            # Verificar stock disponible (solo para productos, no servicios)
            if product.type == 'product':
                try:
                    inventory = InventoryProduct.objects.get(product=product)
                    available_stock = float(inventory.current_stock)
                    
                    if quantity > available_stock:
                        raise serializers.ValidationError(
                            f'Stock insuficiente para {product.name}. '
                            f'Disponible: {available_stock}, Solicitado: {quantity}'
                        )
                except InventoryProduct.DoesNotExist:
                    raise serializers.ValidationError(
                        f'No hay información de inventario para {product.name}'
                    )
        
        return items
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        client_id = validated_data.pop('client_id')
        user = self.context['request'].user
        
        # Verificar que el cliente pertenece al usuario autenticado
        try:
            client = Client.objects.get(id=client_id, user=user)
        except Client.DoesNotExist:
            raise serializers.ValidationError({'client_id': 'Cliente no encontrado o no pertenece a tu cuenta'})
        
        # Crear la factura
        invoice = Invoice.objects.create(client=client, user=user, **validated_data)
        
        # Crear los items y actualizar inventario
        for item_data in items_data:
            product_id = item_data.pop('product_id')
            quantity = item_data['quantity']
            
            product = Product.objects.get(id=product_id, user=user)
            
            # Crear el item de la factura
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                **item_data
            )
            
            # Actualizar inventario solo para productos (no servicios)
            if product.type == 'product':
                inventory = InventoryProduct.objects.get(product=product)
                new_stock = inventory.current_stock - quantity
                
                # Actualizar el stock
                inventory.current_stock = new_stock
                inventory.last_movement_date = timezone.now()
                inventory.save()
                
                # Registrar movimiento de inventario
                InventoryMovement.objects.create(
                    product=product,
                    type='sale',
                    quantity=quantity,
                    reason=f'Venta - Factura #{invoice.invoice_number}',
                    date=invoice.date,
                    resulting_stock=new_stock
                )
        
        return invoice

# Serializer para leer facturas (con objetos completos)
class InvoiceSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('user',)
        
# Serializer para proveedores
class SupplierSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('user',)
    
    def validate(self, data):
        """Validar que la combinación user+ruc sea única"""
        try:
            user = self.context['request'].user
            ruc = data.get('ruc')
            
            if ruc:
                # Verificar si ya existe un proveedor con el mismo RUC para este usuario
                existing_query = Supplier.objects.filter(user=user, ruc=ruc)
                
                # Si estamos editando, excluir el proveedor actual
                if self.instance:
                    existing_query = existing_query.exclude(id=self.instance.id)
                
                if existing_query.exists():
                    raise serializers.ValidationError({
                        'ruc': f'Ya tienes un proveedor registrado con el RUC: {ruc}'
                    })
            
            return data
        except Exception as e:
            print(f"Error in SupplierSerializer validation: {e}")
            return data

# Serializers para inventario
class InventoryProductSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    name = serializers.CharField(source='product.name', read_only=True)
    code = serializers.CharField(source='product.code', read_only=True)
    
    class Meta:
        model = InventoryProduct
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class InventoryMovementSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    movement_type = serializers.SerializerMethodField()
    previous_stock = serializers.SerializerMethodField()
    new_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryMovement
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'resulting_stock')
    
    def get_movement_type(self, obj):
        # Convertir el tipo de movimiento al formato esperado por el frontend
        if obj.type == 'purchase' or (obj.type == 'increase' and 'Compra #' in obj.reason):
            return 'purchase'
        elif obj.type == 'sale' or (obj.type == 'decrease' and 'Venta #' in obj.reason):
            return 'sale'
        elif obj.type in ['increase', 'decrease']:
            return 'adjustment'
        else:
            return obj.type
    
    def get_previous_stock(self, obj):
        # Calcular el stock anterior basado en la cantidad y el stock resultante
        # Los tipos 'increase' y 'purchase' incrementan el stock
        if obj.type in ['increase', 'purchase']:
            return float(obj.resulting_stock) - float(obj.quantity)
        # Los tipos 'decrease' y 'sale' decrementan el stock
        else:
            return float(obj.resulting_stock) + float(obj.quantity)
    
    def get_new_stock(self, obj):
        return float(obj.resulting_stock)

#Serializer para ajustes de inventario
class InventoryAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    type = serializers.ChoiceField(choices=['increase', 'decrease'])
    reason = serializers.CharField(max_length=255)
    date = serializers.DateField()

    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        product = Product.objects.get(id=product_id)
        
        #Obtener o crear el registro de inventario
        inventory, created = InventoryProduct.objects.get_or_create(
            product=product,
            defaults={'current_stock': 0, 'minimum_stock': 0}
        )
        
        #Calcular nuevo stock
        quantity = validated_data['quantity']
        if validated_data['type'] == 'increase':
            new_stock = inventory.current_stock + quantity
        else:
            new_stock = inventory.current_stock - quantity
            if new_stock < 0:
                raise serializers.ValidationError("El stock no puede ser negativo")
        
        #Actualizar inventario
        inventory.current_stock = new_stock
        inventory.last_movement_date = timezone.now()
        inventory.save()
        
        #Crear movimiento
        movement = InventoryMovement.objects.create(
            product=product,
            resulting_stock=new_stock,
            **validated_data
        )
        
        return movement
    
# Serializers para compras
class PurchaseItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = PurchaseItem
        fields = '__all__'
        read_only_fields = ('purchase', 'created_at', 'updated_at')

class CreatePurchaseItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)

class CreatePurchaseSerializer(serializers.Serializer):
    supplier_id = serializers.IntegerField()
    invoice_number = serializers.CharField(max_length=50, allow_blank=True, allow_null=True, required=False)
    date = serializers.DateField()
    payment_method = serializers.CharField(max_length=50)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    tax = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    notes = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    items = CreatePurchaseItemSerializer(many=True)

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        supplier_id = validated_data.pop('supplier_id')
        user = self.context['request'].user
        
        # Verificar que el proveedor pertenece al usuario autenticado
        try:
            supplier = Supplier.objects.get(id=supplier_id, user=user)
        except Supplier.DoesNotExist:
            raise serializers.ValidationError({'supplier_id': 'Proveedor no encontrado o no pertenece a tu cuenta'})
        
        # Crear la compra
        purchase = Purchase.objects.create(supplier=supplier, user=user, **validated_data)
        
        # Crear los items
        for item_data in items_data:
            product_id = item_data.pop('product_id')
            try:
                # Verificar que el producto pertenece al usuario autenticado
                product = Product.objects.get(id=product_id, user=user)
            except Product.DoesNotExist:
                raise serializers.ValidationError({'product_id': f'Producto {product_id} no encontrado o no pertenece a tu cuenta'})
                
            PurchaseItem.objects.create(purchase=purchase, product=product, **item_data)
            
            # Actualizar inventario
            inventory, created = InventoryProduct.objects.get_or_create(
                product=product,
                defaults={'current_stock': 0, 'minimum_stock': 0}
            )
            
            new_stock = inventory.current_stock + item_data['quantity']
            inventory.current_stock = new_stock
            inventory.last_movement_date = timezone.now()
            inventory.save()
            
            # Registrar movimiento de inventario
            InventoryMovement.objects.create(
                product=product,
                type='purchase',
                quantity=item_data['quantity'],
                reason=f'Compra #{purchase.id}',
                date=purchase.date,
                resulting_stock=new_stock
            )
        
        return purchase
        
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items')
        supplier_id = validated_data.pop('supplier_id')
        
        # Actualizar proveedor si ha cambiado
        if instance.supplier.id != supplier_id:
            supplier = Supplier.objects.get(id=supplier_id)
            instance.supplier = supplier
        
        # Actualizar campos de la compra
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Eliminar los items existentes y crear nuevos
        # Primero revertir los cambios en el inventario
        for old_item in instance.items.all():
            # Actualizar inventario (revertir)
            inventory = InventoryProduct.objects.get(product=old_item.product)
            new_stock = inventory.current_stock - old_item.quantity
            inventory.current_stock = new_stock
            inventory.last_movement_date = timezone.now()
            inventory.save()
            
            # Registrar movimiento de inventario (revertir)
            InventoryMovement.objects.create(
                product=old_item.product,
                type='decrease',
                quantity=old_item.quantity,
                reason=f'Actualización de compra #{instance.id} - eliminación de item',
                date=instance.date,
                resulting_stock=new_stock
            )
        
        # Eliminar todos los items existentes
        instance.items.all().delete()
        
        # Crear nuevos items
        for item_data in items_data:
            product_id = item_data.pop('product_id')
            product = Product.objects.get(id=product_id)
            PurchaseItem.objects.create(purchase=instance, product=product, **item_data)
            
            # Actualizar inventario (nuevo)
            inventory, created = InventoryProduct.objects.get_or_create(
                product=product,
                defaults={'current_stock': 0, 'minimum_stock': 0}
            )
            
            new_stock = inventory.current_stock + item_data['quantity']
            inventory.current_stock = new_stock
            inventory.last_movement_date = timezone.now()
            inventory.save()
            
            # Registrar movimiento de inventario (nuevo)
            InventoryMovement.objects.create(
                product=product,
                type='purchase',
                quantity=item_data['quantity'],
                reason=f'Actualización de compra #{instance.id} - nuevo item',
                date=instance.date,
                resulting_stock=new_stock
            )
        
        return instance

class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True, read_only=True)
    supplier = SupplierSerializer(read_only=True)

    class Meta:
        model = Purchase
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')