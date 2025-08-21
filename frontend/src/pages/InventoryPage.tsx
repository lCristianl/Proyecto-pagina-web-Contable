import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, Warehouse, History } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryMovements } from "@/components/inventory/inventory-movements"
import { InventoryAdjustmentDialog } from "@/components/inventory/inventory-adjustment-dialog"
import { apiService, type InventoryItem, type InventoryMovement } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { ClipLoader } from "react-spinners"
import { PageLayout } from "@/components/layout/PageLayout"

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
  const [initialLoading, setInitialLoading] = useState(true)
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
        className: "bg-red-700 text-white",
      })
      // Datos de ejemplo
      setInventory([
        {
          id: 1,
          product_id: 1,
          name: "Laptop Dell Inspiron",
          code: "DELL-001",
          current_stock: 15,
          minimum_stock: 5,
          location: "Almacén A - Estante 1",
          last_movement_date: "2024-01-15T10:30:00Z",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          product: 1,
        },
      ])
    } finally {
      setLoading(false)
      setInitialLoading(false)
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

  const handleSaveAdjustment = async (data: { quantity?: number; reason?: string; location?: string; isLocationUpdate: boolean }) => {
    if (!selectedProduct) return

    try {
      if (data.isLocationUpdate) {
        // Actualizar solo la ubicación
        if (data.location) {
          await apiService.updateProductLocation({
            product_id: selectedProduct.product_id,
            location: data.location
          });
          toast({
            title: "Éxito",
            description: "Ubicación actualizada correctamente",
            className: "bg-green-700 text-white",
          });
        }
      } else {
        // Ajuste de cantidad
        if (data.quantity !== undefined && data.reason) {
          const today = new Date().toISOString().split('T')[0];
          const quantity = data.quantity;
          
          await apiService.adjustInventory({
            product_id: selectedProduct.product_id,
            quantity: Math.abs(quantity),
            type: quantity >= 0 ? 'increase' : 'decrease',
            reason: data.reason,
            date: today,
          });
          toast({
            title: "Éxito",
            description: "Ajuste de inventario realizado correctamente",
            className: "bg-green-700 text-white",
          });
        }
      }
      
      setIsAdjustmentDialogOpen(false)
      fetchInventory()
      fetchMovements()
    } catch (error) {
      toast({
        title: "Error",
        description: data.isLocationUpdate 
          ? "No se pudo actualizar la ubicación del producto" 
          : "No se pudo realizar el ajuste de inventario",
        variant: "destructive",
        className: "bg-red-700 text-white",
      })
    }
  }

  if (initialLoading) {
    return (
      <PageLayout title="Inventario" icon={<Warehouse className="h-5 w-5" />}>
        <div className="flex flex-col items-center justify-center h-screen">
          <ClipLoader color="#1400ff" size={80} />
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">Cargando...</h2>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Inventario" icon={<Warehouse className="h-5 w-5" />}>
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
    </PageLayout>
  )
}
