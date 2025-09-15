from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
import uuid

# Modelo para códigos de recuperación de contraseña
class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)  # ejemplo: "483920"
    created_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # válido solo 10 minutos
        return not self.is_used and (timezone.now() - self.created_at).seconds < 600

    def __str__(self):
        return f"Código {self.code} para {self.user.username}"

# Extender el modelo User por defecto con un perfil
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Campos adicionales si los necesitas en el futuro
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Perfil de {self.user.username}"

# Create your models here.

class Client(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')  # Agregar relación con usuario
    name = models.CharField(max_length=255)
    cedula = models.CharField(max_length=20)
    ruc = models.CharField(max_length=20, unique=True, null=True, blank=True)
    address = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Hacer que la combinación user+cedula sea única (para permitir misma cedula en diferentes usuarios)
        unique_together = [['user', 'cedula']]

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Supplier(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='suppliers')  # Agregar relación con usuario
    name = models.CharField(max_length=255)
    ruc = models.CharField(max_length=20)
    address = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Hacer que la combinación user+ruc sea única
        unique_together = [['user', 'ruc']]
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Product(models.Model):
    PRODUCT_TYPE_CHOICES = [
        ('product', 'Producto'),
        ('service', 'Servicio'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')  # Agregar relación con usuario
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=PRODUCT_TYPE_CHOICES)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    unit_weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Hacer que la combinación user+code sea única
        unique_together = [['user', 'code']]
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"

class InventoryProduct(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    minimum_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    location = models.CharField(max_length=255, blank=True, null=True)
    last_movement_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Inventario de {self.product.name}"

class InventoryMovement(models.Model):
    MOVEMENT_TYPES = [
        ('increase', 'Incremento'),
        ('decrease', 'Decremento'),
        ('purchase', 'Compra'),
        ('sale', 'Venta'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements')
    type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=255)
    date = models.DateField()
    resulting_stock = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_type_display()} de {self.product.name}: {self.quantity}"

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('pending', 'Pendiente'),
        ('sent', 'Enviada'),
        ('paid', 'Pagada'),
        ('overdue', 'Vencida'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')  # Agregar relación con usuario
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=50)
    date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Hacer que la combinación user+invoice_number sea única
        unique_together = [['user', 'invoice_number']]

    def __str__(self):
        return f"Factura {self.invoice_number} ({self.user.username})"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')  # Agregar relación con usuario
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category} - {self.amount} ({self.user.username})"

class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')  # Agregar relación con usuario
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchases')
    invoice_number = models.CharField(max_length=50, blank=True, null=True)
    date = models.DateField()
    payment_method = models.CharField(max_length=50)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Compra {self.id} a {self.supplier.name} ({self.user.username})"

class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"