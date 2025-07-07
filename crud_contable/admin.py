from django.contrib import admin
import crud_contable.models

# Register your models here.
admin.site.register(crud_contable.models.Client)
admin.site.register(crud_contable.models.Product)
admin.site.register(crud_contable.models.Invoice)
admin.site.register(crud_contable.models.InvoiceItem)
admin.site.register(crud_contable.models.Expense)
