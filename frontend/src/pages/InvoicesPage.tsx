import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText } from "lucide-react"
import { InvoicesTable } from "@/components/invoices-table"
import { InvoiceDialog } from "@/components/invoice-dialog"
import { apiService, type Invoice } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { ClipLoader } from "react-spinners"

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const { toast } = useToast()

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await apiService.getInvoices(page, search)
      setInvoices(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 10))
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive",
      })
      // Datos de ejemplo
      setInvoices([
        {
          id: 1,
          client: {
            id: 1,
            name: "Empresa ABC S.A.",
            cedula: "1234567890",
            ruc: "1234567890",
            address: "Av. Principal 123",
            email: "contacto@empresaabc.com",
            phone: "+593 99 123 4567",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          invoice_number: "INV-001",
          date: "2024-01-15",
          due_date: "2024-02-15",
          status: "draft",
          subtotal: 1000.0,
          tax: 120.0,
          total: 1120.0,
          items: [],
          created_at: "2024-01-15T00:00:00Z",
          updated_at: "2024-01-15T00:00:00Z",
        },
      ])
    } finally {
      setLoading(false)
      setInitialLoading(false) // Solo se ejecuta una vez
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [page, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreateInvoice = () => {
    setEditingInvoice(null)
    setIsDialogOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setIsDialogOpen(true)
  }

  const handleDeleteInvoice = async (id: number) => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar esta factura? Esta acción no se puede deshacer.'
    )
    
    if (!confirmDelete) {
      return
    }

    try {
      await apiService.deleteInvoice(id)
      toast({
        title: "Éxito",
        description: "Factura eliminada correctamente",
      })
      // Refrescar la lista inmediatamente
      fetchInvoices()
    } catch (error) {
      console.error('Error al eliminar factura:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la factura",
        variant: "destructive",
      })
    }
  }

  const handleSaveInvoice = async (data: any) => {
    try {
      if (editingInvoice) {
        // Para actualizar, convertir a formato Invoice
        const updateData = {
          ...data,
          client: editingInvoice.client, // Mantener objeto cliente para actualización
        }
        await apiService.updateInvoice(editingInvoice.id, updateData)
        toast({
          title: "Éxito",
          description: "Factura actualizada correctamente",
        })
      } else {
        // Para crear, usar datos tal como vienen
        await apiService.createInvoice(data)
        toast({
          title: "Éxito",
          description: "Factura creada correctamente",
        })
      }
      setIsDialogOpen(false)
      fetchInvoices()
    } catch (error) {
      console.error('Error completo:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar la factura",
        variant: "destructive",
      })
    }
  }

  // Usar initialLoading para el loader de pantalla completa
  if (initialLoading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Facturación</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center h-screen">
          <ClipLoader color="#1400ff" size={80} />
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">Cargando...</h2>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Facturación</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar facturas..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          <Button onClick={handleCreateInvoice} className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Button>
        </div>

        <InvoicesTable
          invoices={invoices}
          loading={loading}
          onEdit={handleEditInvoice}
          onDelete={handleDeleteInvoice}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <InvoiceDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          invoice={editingInvoice}
          onSave={handleSaveInvoice}
        />
      </div>
    </SidebarInset>
  )
}
