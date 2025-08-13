import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Search, Warehouse, History } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryMovements } from "@/components/inventory/inventory-movements"
import { InventoryAdjustmentDialog } from "@/components/inventory/inventory-adjustment-dialog"
import { apiService, type InventoryItem, type InventoryMovement } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null)
  const { toast } = useToast()

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await apiService.getInventory(page, search)
      setInventory(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 10))
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      })
      // Datos de ejemplo
      setInventory([
        {
          id: 1,
          product: {
            id: 1,
            name: "Laptop Dell Inspiron",
            price: 899.99,
            type: "product",
            code: "DELL-001",
            description: "Laptop para oficina",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          current_stock: 15,
          minimum_stock: 5,
          location: "Almacén A - Estante 1",
          last_updated: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          product: {
            id: 2,
            name: "Mouse Inalámbrico",
            price: 25.99,
            type: "product",
            code: "MOUSE-001",
            description: "Mouse inalámbrico ergonómico",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          current_stock: 3,
          minimum_stock: 10,
          location: "Almacén A - Estante 2",
          last_updated: "2024-01-14T15:45:00Z",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchMovements = async () => {
    try {
      setMovementsLoading(true)
      const response = await apiService.getInventoryMovements()
      setMovements(response.data.results)
    } catch (error) {
      console.error("Error fetching movements:", error)
      // Datos de ejemplo
      setMovements([
        {
          id: 1,
          product: {
            id: 1,
            name: "Laptop Dell Inspiron",
            price: 899.99,
            type: "product",
            code: "DELL-001",
            description: "Laptop para oficina",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          movement_type: "purchase",
          quantity: 10,
          previous_stock: 5,
          new_stock: 15,
          date: "2024-01-15",
          reference_id: 1,
          created_at: "2024-01-15T10:30:00Z",
        },
      ])
    } finally {
      setMovementsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [page, search])

  useEffect(() => {
    fetchMovements()
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedProduct(item)
    setIsAdjustmentDialogOpen(true)
  }

  const handleSaveAdjustment = async (data: { quantity: number; reason: string }) => {
    if (!selectedProduct) return

    try {
      await apiService.adjustInventory({
        product_id: selectedProduct.product.id,
        quantity: data.quantity,
        reason: data.reason,
      })
      toast({
        title: "Éxito",
        description: "Ajuste de inventario realizado correctamente",
      })
      setIsAdjustmentDialogOpen(false)
      fetchInventory()
      fetchMovements()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el ajuste de inventario",
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
          <Warehouse className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Inventario</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Stock Actual
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Movimientos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
              </div>
            </div>

            <InventoryTable
              inventory={inventory}
              loading={loading}
              onAdjustStock={handleAdjustStock}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <InventoryMovements movements={movements} loading={movementsLoading} />
          </TabsContent>
        </Tabs>

        <InventoryAdjustmentDialog
          open={isAdjustmentDialogOpen}
          onOpenChange={setIsAdjustmentDialogOpen}
          product={selectedProduct}
          onSave={handleSaveAdjustment}
        />
      </div>
    </SidebarInset>
  )
}
