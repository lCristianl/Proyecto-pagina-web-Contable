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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InventoryItem } from "@/services/api"

interface InventoryAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: InventoryItem | null
  onSave: (data: { quantity?: number; reason?: string; location?: string; isLocationUpdate: boolean }) => void
}

export function InventoryAdjustmentDialog({ open, onOpenChange, product, onSave }: InventoryAdjustmentDialogProps) {
  const [activeTab, setActiveTab] = useState("quantity")
  const [formData, setFormData] = useState({
    quantity: "",
    reason: "",
    location: "",
  })

  useEffect(() => {
    if (!open) {
      setFormData({
        quantity: "",
        reason: "",
        location: "",
      })
      setActiveTab("quantity")
    } else if (product) {
      setFormData(prev => ({
        ...prev,
        location: product.location || ""
      }))
    }
  }, [open, product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeTab === "quantity") {
      const quantity = Number.parseInt(formData.quantity)
      onSave({
        quantity,
        reason: formData.reason,
        isLocationUpdate: false
      })
    } else {
      onSave({
        location: formData.location,
        isLocationUpdate: true
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const newStock = product 
    ? parseFloat(product.current_stock.toString()) + Number.parseInt(formData.quantity || "0") 
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Inventario</DialogTitle>
          <DialogDescription>Realiza ajustes o modificaciones al producto seleccionado.</DialogDescription>
        </DialogHeader>

        {product && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{product.name}</CardTitle>
              <CardDescription>Código: {product.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Stock Actual:</span>
                  <div className="font-medium">{product.current_stock} unidades</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Stock Mínimo:</span>
                  <div className="font-medium">{product.minimum_stock} unidades</div>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Ubicación:</span>
                  <div className="font-medium">{product.location || "No especificada"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quantity">Ajustar Cantidad</TabsTrigger>
            <TabsTrigger value="location">Cambiar Ubicación</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="quantity" className="mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Cantidad de Ajuste *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    placeholder="Ingresa cantidad (+ para aumentar, - para disminuir)"
                    required={activeTab === "quantity"}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nuevo stock: <span className="font-medium">{newStock} unidades</span>
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">Motivo del Ajuste *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                    placeholder="Describe el motivo del ajuste (ej: Inventario físico, producto dañado, etc.)"
                    rows={3}
                    required={activeTab === "quantity"}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Nueva Ubicación *</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Ingresa la nueva ubicación del producto"
                    required={activeTab === "location"}
                  />
                  <p className="text-xs text-muted-foreground">
                    Solo se actualizará la ubicación del producto, no se registrará movimiento de inventario.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <DialogFooter className="mt-6">
              <Button type="button" className="bg-red-500 text-white hover:bg-red-700 cursor-pointer" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
                {activeTab === "quantity" ? "Realizar Ajuste" : "Actualizar Ubicación"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
