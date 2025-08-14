import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { apiService, type Expense } from "@/services/api"
import { ClipLoader } from "react-spinners"

interface ExpensesReportChartProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface MonthlyData {
  month: string
  amount: number
}

// Colores predefinidos para las categorías
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#F06292", "#5C6BC0", "#26A69A", "#FFA726"]

export function ExpensesReportChart({ dateRange }: ExpensesReportChartProps) {
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyData[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)

  // Función para obtener todos los gastos (necesitamos paginar)
  const fetchAllExpenses = async () => {
    setLoading(true)
    try {
      let allExpenses: Expense[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await apiService.getExpenses(page)
        const results = response.data.results
        allExpenses = [...allExpenses, ...results]
        
        if (!response.data.next) {
          hasMore = false
        } else {
          page++
        }
      }

      // Filtrar por rango de fechas
      const filteredExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        const startDate = new Date(dateRange.startDate)
        const endDate = new Date(dateRange.endDate)
        return expenseDate >= startDate && expenseDate <= endDate
      })

      setExpenses(filteredExpenses)
      processExpenses(filteredExpenses)
    } catch (error) {
      console.error("Error fetching expenses:", error)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  // Procesar los gastos para los gráficos
  const processExpenses = (expenses: Expense[]) => {
    // Agrupar por categoría
    const categories: Record<string, number> = {}
    expenses.forEach(expense => {
      const category = expense.category || "Otros"
      categories[category] = (categories[category] || 0) + Number(expense.amount)
    })

    // Convertir a formato para gráfico de torta
    const categoryData: CategoryData[] = Object.keys(categories).map((category, index) => ({
      name: category,
      value: categories[category],
      color: COLORS[index % COLORS.length]
    }))

    // Agrupar por mes
    const months: Record<string, { amount: number, label: string }> = {}
    
    // Definir los meses en español
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      const monthLabel = monthNames[date.getMonth()]
      
      if (!months[monthKey]) {
        months[monthKey] = { amount: 0, label: monthLabel }
      }
      
      months[monthKey].amount += Number(expense.amount)
    })

    // Convertir a formato para gráfico de barras
    const monthlyData: MonthlyData[] = Object.keys(months)
      .sort() // Ordenar por fecha
      .map(key => ({
        month: months[key].label,
        amount: months[key].amount
      }))

    // Calcular total
    const total = categoryData.reduce((sum, category) => sum + category.value, 0)

    setExpensesByCategory(categoryData)
    setMonthlyExpenses(monthlyData)
    setTotalExpenses(total)
  }

  // Cargar datos cuando cambia el rango de fechas
  useEffect(() => {
    fetchAllExpenses()
  }, [dateRange])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <ClipLoader color="#1400ff" size={50} />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
          <CardDescription>Distribución de gastos en el período</CardDescription>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No hay datos de gastos en este período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Gasto"]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolución de Gastos</CardTitle>
          <CardDescription>Gastos mensuales en el período</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyExpenses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No hay datos de gastos en este período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Gastos"]} />
                <Bar dataKey="amount" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Detalle de Gastos por Categoría</CardTitle>
          <CardDescription>
            Análisis detallado del período {dateRange.startDate} - {dateRange.endDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No hay datos de gastos en este período
            </div>
          ) : (
            <div className="space-y-4">
              {expensesByCategory.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${category.value.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((category.value / totalExpenses) * 100).toFixed(1)}% del total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
