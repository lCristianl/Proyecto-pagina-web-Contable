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
import type { InventoryItem } from "@/services/api"

interface InventoryAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: InventoryItem | null
  onSave: (data: { quantity: number; reason: string }) => void
}

export function InventoryAdjustmentDialog({ open, onOpenChange, product, onSave }: InventoryAdjustmentDialogProps) {
  const [formData, setFormData] = useState({
    quantity: "",
    reason: "",
  })

  useEffect(() => {
    if (!open) {
      setFormData({
        quantity: "",
        reason: "",
      })
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const quantity = Number.parseInt(formData.quantity)
    onSave({
      quantity,
      reason: formData.reason,
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const newStock = product ? product.current_stock + Number.parseInt(formData.quantity || "0") : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Inventario</DialogTitle>
          <DialogDescription>Realiza un ajuste manual del stock para el producto seleccionado.</DialogDescription>
        </DialogHeader>

        {product && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{product.product.name}</CardTitle>
              <CardDescription>Código: {product.product.code}</CardDescription>
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
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Cantidad de Ajuste *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder="Ingresa cantidad (+ para aumentar, - para disminuir)"
                required
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
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Realizar Ajuste</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
