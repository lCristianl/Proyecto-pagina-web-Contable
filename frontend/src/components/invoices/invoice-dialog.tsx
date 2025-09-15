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
import type { Invoice, Client, Product, ProductWithStock, InvoiceItem } from "@/services/api"
import { apiService } from "@/services/api"

interface InvoiceFormData {
  client_id: number
  invoice_number: string
  date: string
  due_date: string
  status: "draft" | "sent" | "paid" | "overdue"
  subtotal: number
  tax: number
  total: number
  items: {
    product_id: number
    quantity: number
    unit_price: number
    total: number
  }[]
}

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  onSave: (data: InvoiceFormData | Partial<Invoice>) => void // Usar el nuevo tipo
}

export function InvoiceDialog({ open, onOpenChange, invoice, onSave }: InvoiceDialogProps) {
  const [formData, setFormData] = useState({
    client_id: "",
    date: "",
    due_date: "",
    status: "draft" as "draft" | "sent" | "paid" | "overdue",
  })
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [productsWithStock, setProductsWithStock] = useState<ProductWithStock[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (open) {
      fetchClients()
      fetchProductsWithStock()
    }
  }, [open])

  useEffect(() => {
    if (invoice) {
      setFormData({
        client_id: invoice.client.id.toString(),
        date: invoice.date,
        due_date: invoice.due_date,
        status: invoice.status,
      })
      
      // Normalizar los items
      const normalizedItems = (invoice.items || []).map(item => ({
        ...item,
        quantity: formatNumber(item.quantity),
        unit_price: formatNumber(item.unit_price),
        total: formatNumber(item.total),
      }))
      
      setItems(normalizedItems)
      
      // Actualizar productos seleccionados al cargar factura existente
      const selectedIds = new Set((invoice.items || []).map(item => item.product?.id).filter(Boolean) as number[])
      setSelectedProductIds(selectedIds)
    } else {
      const today = new Date().toISOString().split("T")[0]
      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + 1)
      setFormData({
        client_id: "",
        date: today,
        due_date: dueDate.toISOString().split("T")[0],
        status: "draft",
      })
      setItems([{ product: undefined, quantity: 1, unit_price: 0, total: 0 }])
      setSelectedProductIds(new Set())
    }
  }, [invoice, open])

  const fetchClients = async () => {
    try {
      const response = await apiService.getClients()
      setClients(response.data.results)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchProductsWithStock = async () => {
    try {
      console.log('Fetching products with stock...')
      const response = await apiService.getProductsWithStock()
      console.log('Products with stock response:', response)
      setProductsWithStock(response)
    } catch (error) {
      console.error("Error fetching products with stock:", error)
      // Fallback: cargar productos normales si falla
      try {
        const fallbackResponse = await apiService.getProducts()
        const productsAsStock = fallbackResponse.data.results.map(product => ({
          id: product.id,
          name: product.name,
          code: product.code,
          price: product.price,
          type: product.type,
          description: product.description,
          unit_weight: product.unit_weight,
          created_at: product.created_at,
          updated_at: product.updated_at,
          current_stock: 999, // Stock por defecto
          available: true
        }))
        setProductsWithStock(productsAsStock)
      } catch (fallbackError) {
        console.error("Error fetching fallback products:", fallbackError)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!formData.client_id) {
      alert('Por favor selecciona un cliente')
      return
    }

    if (!formData.date || !formData.due_date) {
      alert('Por favor completa las fechas')
      return
    }

    const validItems = items.filter(item => item.product?.id && item.quantity && item.unit_price)
    
    if (validItems.length === 0) {
      alert('Por favor agrega al menos un producto válido')
      return
    }

    const subtotal = validItems.reduce((sum, item) => sum + (item.total || 0), 0)
    const tax = subtotal * 0.12
    const total = subtotal + tax

    // Generar número de factura automático
    const generateInvoiceNumber = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const timestamp = now.getTime().toString().slice(-6) // Últimos 6 dígitos del timestamp
      return `INV-${year}${month}-${timestamp}`
    }

    const invoiceNumber = invoice ? invoice.invoice_number : generateInvoiceNumber()

    // Buscar el cliente seleccionado
    const selectedClient = clients.find(c => c.id.toString() === formData.client_id)
    
    if (!selectedClient) {
      alert('Cliente no encontrado')
      return
    }

    // Preparar los datos con el formato correcto
    const invoiceData = {
      client_id: parseInt(formData.client_id), // Enviar solo el ID del cliente
      invoice_number: invoiceNumber,
      date: formData.date,
      due_date: formData.due_date,
      status: formData.status,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      items: validItems.map(item => ({
        product_id: parseInt(item.product!.id.toString()), // Enviar solo el ID del producto
        quantity: parseInt(item.quantity?.toString() || '1'),
        unit_price: parseFloat(item.unit_price?.toString() || '0'),
        total: parseFloat((item.total || 0).toFixed(2)),
      })),
    }

    onSave(invoiceData)
  }

  const addItem = () => {
    setItems([...items, { product: undefined, quantity: 1, unit_price: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    const itemToRemove = items[index]
    if (itemToRemove.product?.id) {
      const newSelectedIds = new Set(selectedProductIds)
      newSelectedIds.delete(itemToRemove.product.id)
      setSelectedProductIds(newSelectedIds)
    }
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    const oldItem = newItems[index]
    
    if (field === "product") {
      // Si había un producto seleccionado anteriormente, removerlo del set
      if (oldItem.product?.id) {
        const newSelectedIds = new Set(selectedProductIds)
        newSelectedIds.delete(oldItem.product.id)
        setSelectedProductIds(newSelectedIds)
      }
      
      // Buscar el nuevo producto
      const product = productsWithStock.find((p) => p.id === Number(value))
      if (product) {
        // Verificar si el producto ya está seleccionado
        if (selectedProductIds.has(product.id)) {
          alert(`El producto "${product.name}" ya está agregado a la factura`)
          return
        }
        
        // Verificar disponibilidad de stock para productos físicos
        if (product.type === "product" && !product.available) {
          alert(`El producto "${product.name}" no tiene stock disponible`)
          return
        }
        
        // Actualizar el item y agregar producto al set de seleccionados
        newItems[index] = {
          ...newItems[index],
          product: product,
          unit_price: product.price,
          total: (newItems[index].quantity || 1) * product.price
        }
        
        const newSelectedIds = new Set(selectedProductIds)
        newSelectedIds.add(product.id)
        setSelectedProductIds(newSelectedIds)
      }
    } else if (field === "quantity") {
      const quantity = Number(value) || 0
      const product = oldItem.product
      
      // Validar stock disponible para productos físicos
      if (product && product.type === "product") {
        const productWithStock = productsWithStock.find(p => p.id === product.id)
        if (productWithStock && quantity > productWithStock.current_stock) {
          alert(`No hay suficiente stock. Stock disponible: ${productWithStock.current_stock}`)
          return
        }
      }
      
      newItems[index] = { ...newItems[index], [field]: quantity }
      const unitPrice = Number(newItems[index].unit_price) || 0
      newItems[index].total = quantity * unitPrice
    } else if (field === "unit_price") {
      newItems[index] = { ...newItems[index], [field]: value }
      const quantity = Number(newItems[index].quantity) || 0
      newItems[index].total = quantity * Number(value)
    }

    setItems(newItems)
  }

  // Función helper para manejar números de forma segura
  const formatNumber = (value: number | string | null | undefined): number => {
    if (typeof value === 'number' && !isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  // Cálculos finales
  const subtotal = items.reduce((sum, item) => sum + formatNumber(item.total), 0)
  const tax = subtotal * 0.12
  const total = subtotal + tax

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Editar Factura" : "Nueva Factura"}</DialogTitle>
          <DialogDescription>
            {invoice
              ? "Modifica los datos de la factura seleccionada."
              : "Completa los datos para crear una nueva factura."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value: string) => setFormData((prev) => ({ ...prev, client_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, status: value as typeof formData.status }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="paid">Pagada</SelectItem>
                    <SelectItem value="overdue">Vencida</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="due_date">Fecha de Vencimiento *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Items de la factura */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Items de la Factura</CardTitle>
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
                        <Label>Producto/Servicio</Label>
                        <Select
                          value={item.product?.id?.toString() || ""}
                          onValueChange={(value: string) => updateItem(index, "product", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            {productsWithStock
                              .filter(product => !selectedProductIds.has(product.id) || product.id === item.product?.id)
                              .map((product) => (
                              <SelectItem 
                                key={product.id} 
                                value={product.id.toString()}
                                disabled={product.type === "product" && !product.available}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{product.name} - ${product.price}</span>
                                  {product.type === "product" && (
                                    <span className={`ml-2 text-sm ${product.available ? 'text-green-600' : 'text-red-600'}`}>
                                      Stock: {product.current_stock}
                                    </span>
                                  )}
                                  {product.type === "service" && (
                                    <span className="ml-2 text-sm text-blue-600">Servicio</span>
                                  )}
                                </div>
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
                          max={item.product?.type === "product" ? 
                            productsWithStock.find(p => p.id === item.product?.id)?.current_stock : 
                            undefined
                          }
                          value={item.quantity || 1}
                          onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value))}
                        />
                        {item.product?.type === "product" && (
                          <div className="text-xs text-gray-500 mt-1">
                            Stock disponible: {productsWithStock.find(p => p.id === item.product?.id)?.current_stock || 0}
                          </div>
                        )}
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
                        <Input value={`$${formatNumber(item.total).toFixed(2)}`} disabled />
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
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (12%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
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
              {invoice ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
