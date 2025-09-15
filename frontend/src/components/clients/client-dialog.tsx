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
import type { Client } from "@/services/api"

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  onSave: (data: Partial<Client>) => void
}

export function ClientDialog({ open, onOpenChange, client, onSave }: ClientDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    cedula: "",
    ruc: "",
    address: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        cedula: client.cedula,
        ruc: client.ruc || "",
        address: client.address,
        email: client.email,
        phone: client.phone,
      })
    } else {
      setFormData({
        name: "",
        ruc: "",
        cedula: "",
        address: "",
        email: "",
        phone: "",
      })
    }
  }, [client, open])

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
          <DialogTitle>{client ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Modifica los datos del cliente seleccionado."
              : "Completa los datos para crear un nuevo cliente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nombre del cliente"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => handleChange("cedula", e.target.value)}
                placeholder="1234567890"
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
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="cliente@ejemplo.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="0912345678"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Dirección completa del cliente"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" className="bg-red-500 text-white hover:bg-red-700 cursor-pointer" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
              {client ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
