from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ClientViewSet, ProductViewSet, InvoiceViewSet, ExpenseViewSet, dashboard_stats

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'products', ProductViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
]

urlpatterns += router.urls