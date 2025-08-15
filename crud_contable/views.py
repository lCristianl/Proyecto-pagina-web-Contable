from django.shortcuts import render
from rest_framework import viewsets, filters, status, views
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import (
    Client, Product, Invoice, Expense,
    Supplier, InventoryProduct, InventoryMovement,
    Purchase
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
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'ruc', 'cedula', 'email', 'phone']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['invoice_number', 'client__name']
    
    def get_serializer_class(self):
        # Usar diferentes serializers para crear y leer
        if self.action == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer
    
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
    queryset = Expense.objects.all().order_by('-created_at')
    serializer_class = ExpenseSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['category', 'description']

# Vistas para los nuevos módulos
class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('-created_at')
    serializer_class = SupplierSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'ruc', 'email', 'phone']

class InventoryMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryMovement.objects.all().order_by('-date', '-created_at')
    serializer_class = InventoryMovementSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'reason']

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
    queryset = Purchase.objects.all().order_by('-date', '-created_at')
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['supplier__name', 'invoice_number']

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update' or self.action == 'partial_update':
            return CreatePurchaseSerializer
        return PurchaseSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purchase = serializer.save()
        
        # Retornar la compra con el serializer de lectura
        response_serializer = PurchaseSerializer(purchase)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class InventoryProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryProduct.objects.all().order_by('-updated_at')
    serializer_class = InventoryProductSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'product__code', 'location']

@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now().date()
    month_start = today.replace(day=1)

    # Suma de facturas pagadas del mes actual
    monthly_revenue = Invoice.objects.filter(
        date__gte=month_start, status='paid'
    ).aggregate(total=Sum('total'))['total'] or 0

    # Suma de gastos del mes actual
    monthly_expenses = Expense.objects.filter(
        date__gte=month_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Ganancia neta
    net_profit = monthly_revenue - monthly_expenses

    # Cantidad de facturas pendientes
    pending_invoices = Invoice.objects.filter(
        status='sent'
    ).count()

    data = {
        "monthlyRevenue": monthly_revenue,
        "monthlyExpenses": monthly_expenses,
        "netProfit": net_profit,
        "pendingInvoices": pending_invoices,
    }
    return Response(data)