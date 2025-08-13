from rest_framework import serializers
from .models import (
    Client, Product, Invoice, InvoiceItem, Expense,
    Supplier, InventoryProduct, InventoryMovement,
    Purchase, PurchaseItem
)
from django.utils import timezone

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
    
    def validate_ruc(self, value):
        return value or "N/A"

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

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
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        client_id = validated_data.pop('client_id')
        
        # Obtener el cliente
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            raise serializers.ValidationError({'client_id': 'Cliente no encontrado'})
        
        # Crear la factura
        invoice = Invoice.objects.create(client=client, **validated_data)
        
        # Crear los items
        for item_data in items_data:
            product_id = item_data.pop('product_id')
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError({'product_id': f'Producto {product_id} no encontrado'})
            
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                **item_data
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
    class Meta:
        model = Expense
        fields = '__all__'
        
# Serializer para proveedores
class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

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
    
    class Meta:
        model = InventoryMovement
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'resulting_stock')

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
        supplier = Supplier.objects.get(id=supplier_id)
        
        # Crear la compra
        purchase = Purchase.objects.create(supplier=supplier, **validated_data)
        
        # Crear los items
        for item_data in items_data:
            product_id = item_data.pop('product_id')
            product = Product.objects.get(id=product_id)
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
                type='increase',
                quantity=item_data['quantity'],
                reason=f'Compra #{purchase.id}',
                date=purchase.date,
                resulting_stock=new_stock
            )
        
        return purchase

class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True, read_only=True)
    supplier = SupplierSerializer(read_only=True)

    class Meta:
        model = Purchase
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')