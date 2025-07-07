from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import Client, Product, Invoice, Expense
from .serializers import ClientSerializer, ProductSerializer, InvoiceSerializer, ExpenseSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum

# Create your views here.
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'ruc', 'cedula', 'email', 'phone']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['invoice_number', 'client__name']

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-created_at')
    serializer_class = ExpenseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['category', 'description']

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