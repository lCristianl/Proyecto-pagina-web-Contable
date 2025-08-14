import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import type { Purchase, Supplier, Product, PurchaseItem, CreatePurchaseData } from "@/services/api"
import { apiService } from "@/services/api"

interface PurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchase: Purchase | null
  onSave: (data: CreatePurchaseData) => void
}

export function PurchaseDialog({ open, onOpenChange, purchase, onSave }: PurchaseDialogProps) {
  const [formData, setFormData] = useState({
    supplier_id: "",
    invoice_number: "",
    date: "",
    payment_method: "",
    notes: ""
  })
  const [items, setItems] = useState<Partial<PurchaseItem>[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (open) {
      fetchSuppliers()
      fetchProducts()
    }
  }, [open])

  useEffect(() => {
    if (purchase) {
      setFormData({
        supplier_id: purchase.supplier.id.toString(),
        invoice_number: purchase.invoice_number || "",
        date: purchase.date,
        payment_method: purchase.payment_method,
        notes: ""
      })
      // Asegurarse de que todos los valores numéricos sean números
      const processedItems = purchase.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total)
      }))
      setItems(processedItems || [])
    } else {
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        supplier_id: "",
        invoice_number: "",
        date: today,
        payment_method: "",
        notes: ""
      })
      setItems([{ product: undefined, quantity: 1, unit_price: 0, total: 0 }])
    }
  }, [purchase, open])

  const fetchSuppliers = async () => {
    try {
      const response = await apiService.getSuppliers()
      setSuppliers(response.data.results)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts()
      setProducts(response.data.results.filter((p) => p.type === "product"))
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const tax = subtotal * 0.12 // 12% IVA
    const total = subtotal + tax

    // Validar que haya un proveedor seleccionado
    if (!formData.supplier_id) {
      alert('Debes seleccionar un proveedor')
      return
    }

    // Validar que todos los items tengan producto
    if (items.some(item => !item.product)) {
      alert('Todos los items deben tener un producto seleccionado')
      return
    }

    // Asegurarse de que todos los valores numéricos sean números y tengan 2 decimales
    const toFixedNumber = (num: number): number => {
      return Number(num.toFixed(2));
    }

    // Transformar los items al formato que espera el backend y filtrar los que no tienen product_id
    const transformedItems = items
      .filter(item => item.product?.id !== undefined)
      .map(item => ({
        product_id: item.product!.id,
        quantity: Number(item.quantity) || 0,
        unit_price: toFixedNumber(Number(item.unit_price) || 0),
        total: toFixedNumber(Number(item.total) || 0)
      }))

    // Crear el objeto de datos para enviar al backend
    const purchaseData: CreatePurchaseData = {
      supplier_id: parseInt(formData.supplier_id),
      invoice_number: formData.invoice_number || undefined,
      date: formData.date,
      payment_method: formData.payment_method,
      subtotal: toFixedNumber(Number(subtotal)),
      tax: toFixedNumber(Number(tax)),
      total: toFixedNumber(Number(total)),
      notes: formData.notes || undefined,
      items: transformedItems
    }
    onSave(purchaseData)
  }

  const addItem = () => {
    setItems([...items, { product: undefined, quantity: 1, unit_price: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === "product") {
      const product = products.find((p) => p.id === Number(value))
      if (product) {
        newItems[index].product = product // Asignar el objeto completo del producto
        newItems[index].unit_price = Number(product.price)
        newItems[index].total = (Number(newItems[index].quantity) || 1) * Number(product.price)
      }
    } else if (field === "quantity" || field === "unit_price") {
      const quantity = Number(newItems[index].quantity) || 0
      const unitPrice = Number(newItems[index].unit_price) || 0
      newItems[index].total = quantity * unitPrice
    }

    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0)
  const tax = subtotal * 0.12
  const total = subtotal + tax

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{purchase ? "Editar Compra" : "Nueva Compra"}</DialogTitle>
          <DialogDescription>
            {purchase
              ? "Modifica los datos de la compra seleccionada."
              : "Completa los datos para registrar una nueva compra."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier">Proveedor *</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, supplier_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoice_number">Número de Factura</Label>
                <Input
                  id="invoice_number"
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, invoice_number: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment_method">Método de Pago *</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            {/* Items de la compra */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Items de la Compra</CardTitle>
                  <Button type="button" variant="outline" size="sm" className="bg-blue-500 hover:bg-blue-600 cursor-pointer" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label>Producto</Label>
                        <Select
                          value={item.product?.id?.toString() || ""} // Mostrar el ID del producto seleccionado
                          onValueChange={(value: string) => updateItem(index, "product", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona...">
                              {item.product ? item.product.name : "Selecciona..."} {/* Mostrar el nombre del producto seleccionado */}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - ${product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Precio Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price || 0}
                          onChange={(e) => updateItem(index, "unit_price", Number.parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <Input value={`$${Number(item.total || 0).toFixed(2)}`} disabled />
                      </div>
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 cursor-pointer"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="mt-6 space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${Number(subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (12%):</span>
                    <span>${Number(tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${Number(total).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button type="button" className="bg-red-500 text-white hover:bg-red-700 cursor-pointer" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
              {purchase ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
