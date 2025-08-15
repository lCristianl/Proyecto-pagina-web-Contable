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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Product } from "@/services/api"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (data: Partial<Product>) => void
}

export function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    price: "",
    type: "product" as "product" | "service",
    description: "",
    current_stock: 0,
    minimum_stock: 0,
    location: "",
    unit_weight: "",
  })
  
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        code: product.code,
        price: product.price.toString(),
        type: product.type,
        description: product.description || "",
        current_stock: 0, // Valores por defecto
        minimum_stock: 0, 
        location: "",
        unit_weight: product.unit_weight?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        code: "",
        price: "",
        type: "product",
        description: "",
        current_stock: 0,
        minimum_stock: 0,
        location: "",
        unit_weight: "",
      })
    }
  }, [product, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Si es servicio, no enviamos datos de inventario
    const dataToSave: Partial<Product> = {
      name: formData.name,
      code: formData.code,
      type: formData.type,
      description: formData.description,
      price: Number.parseFloat(formData.price),
    }
    
    // Convertir el peso unitario a número si está definido
    if (formData.unit_weight) {
      dataToSave.unit_weight = Number.parseFloat(formData.unit_weight)
    }
    
    // Solo añadir campos de inventario si es un producto y es creación (no edición)
    if (formData.type === "product" && !product) {
      dataToSave.current_stock = Number(formData.current_stock)
      dataToSave.minimum_stock = Number(formData.minimum_stock)
      // Solo incluimos location si tiene algún valor
      if (formData.location) {
        dataToSave.location = formData.location
      }
    }
    
    onSave(dataToSave)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Modifica los datos del producto seleccionado."
              : "Completa los datos para crear un nuevo producto o servicio."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                disabled={formData.type !== "product" || product !== null}
                title={product ? "No se puede modificar el inventario al editar" : 
                      formData.type !== "product" ? "Solo disponible para productos" : ""}
              >
                Inventario Inicial
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-0">
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nombre del producto o servicio"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                    placeholder="PROD-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => {
                      handleChange("type", value)
                      // Si cambia a "service", cambiar a la pestaña general
                      if (value === "service") {
                        setActiveTab("general")
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Producto</SelectItem>
                      <SelectItem value="service">Servicio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                {formData.type === "product" && (
                  <div className="grid gap-2">
                    <Label htmlFor="unit_weight">Peso por Unidad (kg)</Label>
                    <Input
                      id="unit_weight"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.unit_weight}
                      onChange={(e) => handleChange("unit_weight", e.target.value)}
                      placeholder="0.000"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Descripción del producto o servicio"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="mt-0">
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="current_stock">Stock Inicial</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.current_stock}
                    onChange={(e) => handleChange("current_stock", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minimum_stock">Stock Mínimo</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimum_stock}
                    onChange={(e) => handleChange("minimum_stock", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Bodega principal, Estante A3, etc."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" className="bg-red-500 text-white hover:bg-red-700 cursor-pointer" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
              {product ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
