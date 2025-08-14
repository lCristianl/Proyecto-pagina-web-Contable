from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    ClientViewSet, ProductViewSet, InvoiceViewSet, ExpenseViewSet, dashboard_stats,
    SupplierViewSet, InventoryProductViewSet, InventoryMovementViewSet, 
    InventoryAdjustmentView, PurchaseViewSet
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'products', ProductViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'inventory', InventoryProductViewSet)
router.register(r'inventory-movements', InventoryMovementViewSet)
router.register(r'purchases', PurchaseViewSet)

urlpatterns = [
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('inventory/adjustments/', InventoryAdjustmentView.as_view(), name='inventory-adjustments'),
]

urlpatterns += router.urls