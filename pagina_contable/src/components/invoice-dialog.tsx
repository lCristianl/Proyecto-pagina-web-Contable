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
import type { Invoice, Client, Product, InvoiceItem } from "@/services/api"
import { apiService } from "@/services/api"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  onSave: (data: Partial<Invoice>) => void
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
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (open) {
      fetchClients()
      fetchProducts()
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
      setItems(invoice.items || [])
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

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts()
      setProducts(response.data.results)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const tax = subtotal * 0.12 // 12% IVA
    const total = subtotal + tax

    // Busca el cliente seleccionado
    const selectedClient = clients.find(c => c.id.toString() === formData.client_id)

    onSave({
      ...formData,
      client: selectedClient,
      items: items as InvoiceItem[],
      subtotal,
      tax,
      total,
    })
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
      const product = products.find((p) => p.id === Number.parseInt(value))
      if (product) {
        newItems[index].unit_price = product.price
        newItems[index].total = (newItems[index].quantity || 1) * product.price
      }
    } else if (field === "quantity" || field === "unit_price") {
      const quantity = newItems[index].quantity || 0
      const unitPrice = newItems[index].unit_price || 0
      newItems[index].total = quantity * unitPrice
    }

    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
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
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, client_id: value }))}
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
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as typeof formData.status }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
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
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
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
                          onValueChange={(value) => updateItem(index, "product", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
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
                        <Input value={`$${(item.total || 0).toFixed(2)}`} disabled />
                      </div>
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{invoice ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
