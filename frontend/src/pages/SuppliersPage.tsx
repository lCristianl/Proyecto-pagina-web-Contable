import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Truck } from "lucide-react"
import { SuppliersTable } from "@/components/suppliers/suppliers-table"
import { SupplierDialog } from "@/components/suppliers/supplier-dialog"
import { apiService, type Supplier } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const { toast } = useToast()

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSuppliers(page, search)
      setSuppliers(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 10))
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      })
      // Datos de ejemplo para demostración
      setSuppliers([
        {
          id: 1,
          name: "Distribuidora Tech S.A.",
          ruc_cedula: "1234567890",
          address: "Av. Industrial 456",
          email: "ventas@distribuidoratech.com",
          phone: "+593 99 987 6543",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          name: "Suministros Oficina Ltda.",
          ruc_cedula: "0987654321",
          address: "Calle Comercial 789",
          email: "info@suministrosoficina.com",
          phone: "+593 98 123 4567",
          created_at: "2024-01-02T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [page, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreateSupplier = () => {
    setEditingSupplier(null)
    setIsDialogOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsDialogOpen(true)
  }

  const handleDeleteSupplier = async (id: number) => {
    try {
      await apiService.deleteSupplier(id)
      toast({
        title: "Éxito",
        description: "Proveedor eliminado correctamente",
      })
      fetchSuppliers()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
        variant: "destructive",
      })
    }
  }

  const handleSaveSupplier = async (data: Partial<Supplier>) => {
    try {
      if (editingSupplier) {
        await apiService.updateSupplier(editingSupplier.id, data)
        toast({
          title: "Éxito",
          description: "Proveedor actualizado correctamente",
        })
      } else {
        await apiService.createSupplier(data)
        toast({
          title: "Éxito",
          description: "Proveedor creado correctamente",
        })
      }
      setIsDialogOpen(false)
      fetchSuppliers()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el proveedor",
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Proveedores</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proveedores..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          <Button onClick={handleCreateSupplier}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>

        <SuppliersTable
          suppliers={suppliers}
          loading={loading}
          onEdit={handleEditSupplier}
          onDelete={handleDeleteSupplier}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <SupplierDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          supplier={editingSupplier}
          onSave={handleSaveSupplier}
        />
      </div>
    </SidebarInset>
  )
}
