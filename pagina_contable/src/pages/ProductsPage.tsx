import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Package } from "lucide-react"
import { ProductsTable } from "@/components/products-table"
import { ProductDialog } from "@/components/product-dialog"
import { apiService, type Product } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { ClipLoader } from "react-spinners" // Añadir esta importación

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProducts(page, search)
      setProducts(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 10))
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
      // Datos de ejemplo
      setProducts([
        {
          id: 1,
          name: "Laptop Dell Inspiron",
          price: 899.99,
          type: "product",
          code: "DELL-001",
          description: "Laptop para oficina con 8GB RAM",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          name: "Consultoría IT",
          price: 150.0,
          type: "service",
          code: "SERV-001",
          description: "Consultoría técnica por hora",
          created_at: "2024-01-02T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
        },
      ])
    } finally {
      setLoading(false)
      setInitialLoading(false) // Solo se ejecuta una vez
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      await apiService.deleteProduct(id)
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      })
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const handleSaveProduct = async (data: Partial<Product>) => {
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, data)
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
        })
      } else {
        await apiService.createProduct(data)
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
        })
      }
      setIsDialogOpen(false)
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
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
            <Package className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Productos y Servicios</h1>
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
        <h1 className="text-lg font-semibold">Productos y Servicios</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
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
          <Button onClick={handleCreateProduct} className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        <ProductsTable
          products={products}
          loading={loading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <ProductDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={editingProduct}
          onSave={handleSaveProduct}
        />
      </div>
    </SidebarInset>
  )
}
