import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, ShoppingCart } from "lucide-react"
import { PurchasesTable } from "@/components/purchases/purchases-table"
import { PurchaseDialog } from "@/components/purchases/purchase-dialog"
import { apiService, type Purchase, type CreatePurchaseData } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { ClipLoader } from "react-spinners"

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
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
        className: "bg-red-700 text-white",
      })
      // Datos de ejemplo
      setPurchases([
        {
          id: 1,
          supplier: {
            id: 1,
            name: "Proveedor 1",
            ruc: "12345678901",
            address: "Calle Falsa 123",
            email: "contacto@proveedor1.com",
            phone: "123456789",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
          },
          invoice_number: "128437",
          date: "2024-01-01",
          payment_method: "tarjeta",
          subtotal: 100,
          tax: 15,
          total: 115,
          items: [{
              id: 1,
              product: {
                  id: 1,
                  name: "Producto 1",
                  description: "Descripción del producto 1",
                  price: 100,
                  type: "product",
                  code: "P001",
                  created_at: "2024-01-01T00:00:00Z",
                  updated_at: "2024-01-01T00:00:00Z"
              },
              quantity: 10,
              unit_price: 100,
              total: 1000
          }],
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        }
      ])
    } finally {
      setLoading(false)
      setInitialLoading(false)
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
        className: "bg-green-700 text-white",
      })
      fetchPurchases()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la compra",
        variant: "destructive",
        className: "bg-red-700 text-white",
      })
    }
  }

  const handleSavePurchase = async (data: Partial<Purchase> | CreatePurchaseData) => {
    try {
      if (editingPurchase) {
        // Para actualizaciones, siempre usamos el formato CreatePurchaseData
        const updateData = data as CreatePurchaseData;
        await apiService.updatePurchase(editingPurchase.id, updateData)
        toast({
          title: "Éxito",
          description: "Compra actualizada correctamente",
          className: "bg-green-700 text-white",
        })
      } else {
        await apiService.createPurchase(data as CreatePurchaseData)
        toast({
          title: "Éxito",
          description: "Compra creada correctamente",
          className: "bg-green-700 text-white",
        })
      }
      setIsDialogOpen(false)
      fetchPurchases()
    } catch (error) {
      console.error("Error al guardar la compra:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la compra",
        variant: "destructive",
        className: "bg-red-700 text-white",
      })
    }
  }

  if (initialLoading) {
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
        <div className="flex flex-col items-center justify-center h-screen">
          <ClipLoader color="#1400ff" size={80} />
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">
            Cargando...
          </h2>
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
          <Button onClick={handleCreatePurchase} className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
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
