import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, ShoppingCart } from "lucide-react"
import { PurchasesTable } from "@/components/purchases/purchases-table"
import { PurchaseDialog } from "@/components/purchases/purchase-dialog"
import { apiService, type Purchase } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const { toast } = useToast()

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPurchases(page, search)
      setPurchases(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 10))
    } catch (error) {
      console.error("Error fetching purchases:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las compras",
        variant: "destructive",
      })
      // Datos de ejemplo
      setPurchases([
        {
          id: 1,
          supplier: {
            id: 1,
            name: "Distribuidora Tech S.A.",
            ruc_cedula: "1234567890",
            address: "Av. Industrial 456",
            email: "ventas@distribuidoratech.com",
            phone: "+593 99 987 6543",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          purchase_number: "COMP-001",
          date: "2024-01-15",
          payment_method: "Transferencia",
          status: "completed",
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
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [page, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreatePurchase = () => {
    setEditingPurchase(null)
    setIsDialogOpen(true)
  }

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setIsDialogOpen(true)
  }

  const handleDeletePurchase = async (id: number) => {
    try {
      await apiService.deletePurchase(id)
      toast({
        title: "Éxito",
        description: "Compra eliminada correctamente",
      })
      fetchPurchases()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la compra",
        variant: "destructive",
      })
    }
  }

  const handleSavePurchase = async (data: Partial<Purchase>) => {
    try {
      if (editingPurchase) {
        await apiService.updatePurchase(editingPurchase.id, data)
        toast({
          title: "Éxito",
          description: "Compra actualizada correctamente",
        })
      } else {
        await apiService.createPurchase(data)
        toast({
          title: "Éxito",
          description: "Compra creada correctamente",
        })
      }
      setIsDialogOpen(false)
      fetchPurchases()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la compra",
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
          <ShoppingCart className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Compras</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar compras..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          <Button onClick={handleCreatePurchase}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Compra
          </Button>
        </div>

        <PurchasesTable
          purchases={purchases}
          loading={loading}
          onEdit={handleEditPurchase}
          onDelete={handleDeletePurchase}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <PurchaseDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          purchase={editingPurchase}
          onSave={handleSavePurchase}
        />
      </div>
    </SidebarInset>
  )
}
