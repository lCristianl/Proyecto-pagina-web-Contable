from rest_framework import serializers
from .models import Client, Product, Invoice, InvoiceItem, Expense

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