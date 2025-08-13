import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Receipt } from "lucide-react"
import { ExpensesTable } from "@/components/expenses/expenses-table"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { ExpenseStats } from "@/components/expenses/expense-stats"
import { apiService, type Expense } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { ClipLoader } from "react-spinners"

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { toast } = useToast()

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await apiService.getExpenses(page, search)
      setExpenses(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 10))
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los gastos",
        variant: "destructive",
      })
      // Datos de ejemplo
      setExpenses([
        {
          id: 1,
          category: "Alquiler",
          amount: 2000.0,
          date: "2024-01-01",
          description: "Alquiler mensual de oficina",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          category: "Servicios",
          amount: 150.0,
          date: "2024-01-02",
          description: "Factura de electricidad",
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
    fetchExpenses()
  }, [page, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreateExpense = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDeleteExpense = async (id: number) => {
    try {
      await apiService.deleteExpense(id)
      toast({
        title: "Éxito",
        description: "Gasto eliminado correctamente",
      })
      fetchExpenses()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto",
        variant: "destructive",
      })
    }
  }

  const handleSaveExpense = async (data: Partial<Expense>) => {
    try {
      if (editingExpense) {
        await apiService.updateExpense(editingExpense.id, data)
        toast({
          title: "Éxito",
          description: "Gasto actualizado correctamente",
        })
      } else {
        await apiService.createExpense(data)
        toast({
          title: "Éxito",
          description: "Gasto creado correctamente",
        })
      }
      setIsDialogOpen(false)
      fetchExpenses()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el gasto",
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
            <Receipt className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Gastos</h1>
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
          <Receipt className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Gastos</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ExpenseStats expenses={expenses} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar gastos..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          <Button onClick={handleCreateExpense} className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Gasto
          </Button>
        </div>

        <ExpensesTable
          expenses={expenses}
          loading={loading}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <ExpenseDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          expense={editingExpense}
          onSave={handleSaveExpense}
        />
      </div>
    </SidebarInset>
  )
}
