from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    ClientViewSet, ProductViewSet, InvoiceViewSet, ExpenseViewSet, dashboard_stats,
    SupplierViewSet, InventoryProductViewSet, InventoryMovementViewSet, 
    InventoryAdjustmentView, PurchaseViewSet, ProductLocationView,
    login_view, logout_view, check_auth_view, forgot_password_view,
    verify_reset_code_view, reset_password_view, csrf_token_view, expenses_stats,
    products_with_stock
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
    path('expenses/stats/', expenses_stats, name='expenses-stats'),
    path('products/with-stock/', products_with_stock, name='products-with-stock'),
    path('inventory/adjustments/', InventoryAdjustmentView.as_view(), name='inventory-adjustments'),
    path('inventory/location/', ProductLocationView.as_view(), name='product-location-update'),
    # URLs de autenticación
    path('auth/csrf-token/', csrf_token_view, name='csrf-token'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/check/', check_auth_view, name='check-auth'),
    path('auth/forgot-password/', forgot_password_view, name='forgot-password'),
    path('auth/verify-code/', verify_reset_code_view, name='verify-reset-code'),
    path('auth/reset-password/', reset_password_view, name='reset-password'),
]

urlpatterns += router.urls