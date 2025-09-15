from django.shortcuts import render
from rest_framework import viewsets, filters, status, views
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.http import JsonResponse
from django.conf import settings
from django.middleware.csrf import get_token
import json
import random
from .models import (
    Client, Product, Invoice, Expense,
    Supplier, InventoryProduct, InventoryMovement,
    Purchase, UserProfile, PasswordResetCode
)
from .serializers import (
    ClientSerializer, ProductSerializer, 
    InvoiceSerializer, InvoiceCreateSerializer, 
    ExpenseSerializer, 
    SupplierSerializer, InventoryProductSerializer, InventoryMovementSerializer, 
    InventoryAdjustmentSerializer, PurchaseSerializer, CreatePurchaseSerializer
)
from rest_framework.decorators import api_view
from django.utils import timezone
from django.db.models import Sum

# Create your views here.
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()  # Queryset base para el router
    serializer_class = ClientSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'ruc', 'cedula', 'email', 'phone']

    def get_queryset(self):
        # Filtrar solo los clientes del usuario autenticado
        if self.request.user.is_authenticated:
            return Client.objects.filter(user=self.request.user).order_by('-created_at')
        return Client.objects.none()

    def perform_create(self, serializer):
        # Asignar automáticamente el usuario autenticado al crear
        serializer.save(user=self.request.user)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()  # Queryset base para el router
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

    def get_queryset(self):
        # Filtrar solo los productos del usuario autenticado
        if self.request.user.is_authenticated:
            return Product.objects.filter(user=self.request.user).order_by('-created_at')
        return Product.objects.none()

    def perform_create(self, serializer):
        # Asignar automáticamente el usuario autenticado al crear
        serializer.save(user=self.request.user)

@api_view(['GET'])
def products_with_stock(request):
    """Endpoint para obtener productos con información de stock para facturas"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    products = Product.objects.filter(user=request.user).order_by('name')
    products_data = []
    
    for product in products:
        product_data = {
            'id': product.id,
            'name': product.name,
            'code': product.code,
            'price': product.price,
            'type': product.type,
            'description': product.description,
            'unit_weight': product.unit_weight,
            'created_at': product.created_at.isoformat(),
            'updated_at': product.updated_at.isoformat(),
            'current_stock': 0,  # Default para servicios
            'available': True
        }
        
        # Solo agregar información de stock para productos (no servicios)
        if product.type == 'product':
            try:
                inventory = InventoryProduct.objects.get(product=product)
                product_data['current_stock'] = float(inventory.current_stock)
                product_data['available'] = inventory.current_stock > 0
            except InventoryProduct.DoesNotExist:
                product_data['current_stock'] = 0
                product_data['available'] = False
        else:
            # Los servicios siempre están disponibles
            product_data['available'] = True
        
        products_data.append(product_data)
    
    return Response(products_data)

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()  # Queryset base para el router
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['invoice_number', 'client__name']
    
    def get_queryset(self):
        # Filtrar solo las facturas del usuario autenticado
        if self.request.user.is_authenticated:
            return Invoice.objects.filter(user=self.request.user).order_by('-created_at')
        return Invoice.objects.none()

    def get_serializer_class(self):
        # Usar diferentes serializers para crear y leer
        if self.action == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer
    
    def perform_create(self, serializer):
        # Asignar automáticamente el usuario autenticado al crear
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invoice = serializer.save()
        
        # Retornar la factura con el serializer de lectura
        response_serializer = InvoiceSerializer(invoice)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Factura no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()  # Queryset base para el router
    serializer_class = ExpenseSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['category', 'description']

    def get_queryset(self):
        # Filtrar solo los gastos del usuario autenticado
        if self.request.user.is_authenticated:
            return Expense.objects.filter(user=self.request.user).order_by('-created_at')
        return Expense.objects.none()

    def perform_create(self, serializer):
        # Asignar automáticamente el usuario autenticado al crear
        serializer.save(user=self.request.user)

# Vistas para los nuevos módulos
class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()  # Queryset base para el router
    serializer_class = SupplierSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'ruc', 'email', 'phone']

    def get_queryset(self):
        # Filtrar solo los proveedores del usuario autenticado
        if self.request.user.is_authenticated:
            return Supplier.objects.filter(user=self.request.user).order_by('-created_at')
        return Supplier.objects.none()

    def perform_create(self, serializer):
        # Agregar logging para debug
        print(f"Creating supplier with data: {self.request.data}")
        print(f"User: {self.request.user}")
        
        # Asignar automáticamente el usuario autenticado al crear
        serializer.save(user=self.request.user)

class InventoryMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryMovement.objects.all()  # Queryset base para el router
    serializer_class = InventoryMovementSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'reason']

    def get_queryset(self):
        # Filtrar solo los movimientos de productos del usuario autenticado
        if self.request.user.is_authenticated:
            return InventoryMovement.objects.filter(product__user=self.request.user).order_by('-date', '-created_at')
        return InventoryMovement.objects.none()

class InventoryAdjustmentView(views.APIView):
    def post(self, request):
        serializer = InventoryAdjustmentSerializer(data=request.data)
        if serializer.is_valid():
            movement = serializer.save()
            return Response(InventoryMovementSerializer(movement).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductLocationView(views.APIView):
    def post(self, request):
        product_id = request.data.get('product_id')
        location = request.data.get('location')
        
        if not product_id or location is None:
            return Response({
                "error": "Se requieren los campos product_id y location"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            product = Product.objects.get(id=product_id)
            inventory_product = InventoryProduct.objects.get(product=product)
            
            # Actualizar solo la ubicación
            inventory_product.location = location
            inventory_product.save(update_fields=['location', 'updated_at'])
            
            return Response(InventoryProductSerializer(inventory_product).data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except InventoryProduct.DoesNotExist:
            # Crear un registro de inventario si no existe
            inventory_product = InventoryProduct.objects.create(
                product=product,
                location=location,
                current_stock=0,
                minimum_stock=0
            )
            return Response(InventoryProductSerializer(inventory_product).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()  # Queryset base para el router
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['supplier__name', 'invoice_number']

    def get_queryset(self):
        # Filtrar solo las compras del usuario autenticado
        if self.request.user.is_authenticated:
            return Purchase.objects.filter(user=self.request.user).order_by('-date', '-created_at')
        return Purchase.objects.none()

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update' or self.action == 'partial_update':
            return CreatePurchaseSerializer
        return PurchaseSerializer

    def perform_create(self, serializer):
        # Asignar automáticamente el usuario autenticado al crear
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purchase = serializer.save()
        
        # Retornar la compra con el serializer de lectura
        response_serializer = PurchaseSerializer(purchase)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class InventoryProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryProduct.objects.all()  # Queryset base para el router
    serializer_class = InventoryProductSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'product__code', 'location']

    def get_queryset(self):
        # Filtrar solo los productos de inventario del usuario autenticado
        if self.request.user.is_authenticated:
            return InventoryProduct.objects.filter(product__user=self.request.user).order_by('-updated_at')
        return InventoryProduct.objects.none()

@api_view(['GET'])
def dashboard_stats(request):
    # Verificar que el usuario esté autenticado
    if not request.user.is_authenticated:
        return Response({'error': 'Usuario no autenticado'}, status=401)
    
    today = timezone.now().date()
    month_start = today.replace(day=1)

    # Suma de facturas pagadas del mes actual - filtrar por usuario
    monthly_revenue = Invoice.objects.filter(
        user=request.user,
        date__gte=month_start, 
        status='paid'
    ).aggregate(total=Sum('total'))['total'] or 0

    # Suma de gastos del mes actual - filtrar por usuario
    monthly_expenses = Expense.objects.filter(
        user=request.user,
        date__gte=month_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Ganancia neta
    net_profit = monthly_revenue - monthly_expenses

    # Cantidad de facturas pendientes - filtrar por usuario
    pending_invoices = Invoice.objects.filter(
        user=request.user,
        status='sent'
    ).count()

    data = {
        "monthlyRevenue": monthly_revenue,
        "monthlyExpenses": monthly_expenses,
        "netProfit": net_profit,
        "pendingInvoices": pending_invoices,
    }
    return Response(data)

@api_view(['GET'])
def expenses_stats(request):
    """Obtener estadísticas de gastos por categoría para el usuario autenticado"""
    # Verificar que el usuario esté autenticado
    if not request.user.is_authenticated:
        return Response({'error': 'Usuario no autenticado'}, status=401)
    
    today = timezone.now().date()
    month_start = today.replace(day=1)
    
    # Obtener gastos por categoría del mes actual
    expenses_by_category = Expense.objects.filter(
        user=request.user,
        date__gte=month_start
    ).values('category').annotate(
        total_amount=Sum('amount')
    ).order_by('-total_amount')
    
    # Formatear los datos para el gráfico
    chart_data = [
        {
            'category': expense['category'],
            'amount': float(expense['total_amount'])
        }
        for expense in expenses_by_category
    ]
    
    # Si no hay datos, devolver array vacío
    if not chart_data:
        chart_data = []
    
    return Response({
        'expenses_by_category': chart_data,
        'month': month_start.strftime('%B %Y')
    })

# Vistas de autenticación
@csrf_exempt
def csrf_token_view(request):
    """Vista para obtener el token CSRF"""
    if request.method == 'GET':
        return JsonResponse({
            'csrf_token': get_token(request)
        })
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({
                    'error': True,
                    'message': 'Usuario y contraseña son requeridos',
                    'errors': {
                        'username': ['Este campo es requerido'] if not username else [],
                        'password': ['Este campo es requerido'] if not password else []
                    }
                }, status=400)
            
            # Intentar autenticar con username o email
            user = None
            if '@' in username:
                # Si contiene @, intentar buscar por email
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(request, username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            else:
                # Si no, autenticar por username
                user = authenticate(request, username=username, password=password)
            
            if user is not None and user.is_active:
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'message': 'Login exitoso',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff,
                    }
                })
            else:
                return JsonResponse({
                    'error': True,
                    'message': 'Credenciales inválidas',
                    'errors': {
                        'username': ['Usuario o contraseña incorrectos'],
                        'password': ['Usuario o contraseña incorrectos']
                    }
                }, status=401)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'error': True,
                'message': 'Datos JSON inválidos'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'error': True,
                'message': f'Error interno del servidor: {str(e)}'
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        try:
            logout(request)
            return JsonResponse({
                'success': True,
                'message': 'Logout exitoso'
            })
        except Exception as e:
            return JsonResponse({
                'error': True,
                'message': f'Error al cerrar sesión: {str(e)}'
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def check_auth_view(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return JsonResponse({
                'authenticated': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'is_staff': request.user.is_staff,
                }
            })
        else:
            return JsonResponse({
                'authenticated': False
            })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Función auxiliar para enviar código de recuperación
def send_reset_code(user):
    """Envía un código de 6 dígitos al email del usuario"""
    code = str(random.randint(100000, 999999))  # 6 dígitos
    
    # Invalidar códigos anteriores
    PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
    
    # Crear nuevo código
    PasswordResetCode.objects.create(user=user, code=code)

    # Enviar email
    subject = 'Código de verificación - Sistema Contable'
    message = f'''
    Hola {user.first_name or user.username},
    
    Tu código de verificación para recuperar tu contraseña es:
    
    {code}
    
    Este código es válido por 10 minutos. Si no solicitaste este cambio, puedes ignorar este email.
    
    Saludos,
    Equipo Sistema Contable
    '''
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

@csrf_exempt
def forgot_password_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({
                    'error': True,
                    'message': 'El email es requerido'
                }, status=400)
            
            try:
                user = User.objects.get(email=email)
                
                # Enviar código de verificación
                try:
                    send_reset_code(user)
                    return JsonResponse({
                        'success': True,
                        'message': 'Se ha enviado un código de verificación a tu email'
                    })
                except Exception as mail_error:
                    return JsonResponse({
                        'error': True,
                        'message': 'Error al enviar el email. Inténtalo más tarde.'
                    }, status=500)
                    
            except User.DoesNotExist:
                # No revelar que el email no existe por seguridad
                return JsonResponse({
                    'success': True,
                    'message': 'Si el email existe, recibirás un código de verificación'
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'error': True,
                'message': 'Datos JSON inválidos'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'error': True,
                'message': f'Error interno del servidor: {str(e)}'
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def verify_reset_code_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            code = data.get('code')
            
            if not email or not code:
                return JsonResponse({
                    'error': True,
                    'message': 'Email y código son requeridos'
                }, status=400)
            
            try:
                user = User.objects.get(email=email)
                reset_code = PasswordResetCode.objects.filter(
                    user=user,
                    code=code,
                    is_used=False
                ).first()
                
                if reset_code and reset_code.is_valid():
                    return JsonResponse({
                        'success': True,
                        'message': 'Código verificado correctamente',
                        'valid': True
                    })
                else:
                    return JsonResponse({
                        'error': True,
                        'message': 'Código inválido o expirado',
                        'valid': False
                    }, status=400)
                    
            except User.DoesNotExist:
                return JsonResponse({
                    'error': True,
                    'message': 'Usuario no encontrado',
                    'valid': False
                }, status=404)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'error': True,
                'message': 'Datos JSON inválidos'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'error': True,
                'message': f'Error interno del servidor: {str(e)}'
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def reset_password_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            code = data.get('code')
            new_password = data.get('new_password')
            
            if not email or not code or not new_password:
                return JsonResponse({
                    'error': True,
                    'message': 'Email, código y nueva contraseña son requeridos'
                }, status=400)
            
            if len(new_password) < 6:
                return JsonResponse({
                    'error': True,
                    'message': 'La contraseña debe tener al menos 6 caracteres'
                }, status=400)
            
            try:
                user = User.objects.get(email=email)
                reset_code = PasswordResetCode.objects.filter(
                    user=user,
                    code=code,
                    is_used=False
                ).first()
                
                if reset_code and reset_code.is_valid():
                    # Cambiar la contraseña
                    user.set_password(new_password)
                    user.save()
                    
                    # Marcar el código como usado
                    reset_code.is_used = True
                    reset_code.save()
                    
                    # Invalidar todos los otros códigos del usuario
                    PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
                    
                    return JsonResponse({
                        'success': True,
                        'message': 'Contraseña cambiada correctamente'
                    })
                else:
                    return JsonResponse({
                        'error': True,
                        'message': 'Código inválido o expirado'
                    }, status=400)
                    
            except User.DoesNotExist:
                return JsonResponse({
                    'error': True,
                    'message': 'Usuario no encontrado'
                }, status=404)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'error': True,
                'message': 'Datos JSON inválidos'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'error': True,
                'message': f'Error interno del servidor: {str(e)}'
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)