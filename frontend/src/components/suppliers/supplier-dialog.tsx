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
import type { Supplier } from "@/services/api"

interface SupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onSave: (data: Partial<Supplier>) => void
}

export function SupplierDialog({ open, onOpenChange, supplier, onSave }: SupplierDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    ruc: "",
    address: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        ruc: supplier.ruc || "",
        address: supplier.address,
        email: supplier.email,
        phone: supplier.phone,
      })
    } else {
      setFormData({
        name: "",
        ruc: "",
        address: "",
        email: "",
        phone: "",
      })
    }
  }, [supplier, open])

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave({ ...formData, ruc: formData.ruc.trim() === "" ? "N/A" : formData.ruc })
    }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplier ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
          <DialogDescription>
            {supplier
              ? "Modifica los datos del proveedor seleccionado."
              : "Completa los datos para crear un nuevo proveedor."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nombre del proveedor"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => handleChange("ruc", e.target.value)}
                placeholder="RUC (opcional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="proveedor@ejemplo.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+593 99 123 4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Dirección completa del proveedor"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" className="bg-red-500 text-white hover:bg-red-700 cursor-pointer" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
              {supplier ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
