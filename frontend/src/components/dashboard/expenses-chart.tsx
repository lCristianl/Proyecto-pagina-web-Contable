import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { apiService, type ExpenseByCategory } from "@/services/api"
import { Loader2 } from "lucide-react"

export function ExpensesChart() {
  const [expensesData, setExpensesData] = useState<ExpenseByCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState("")

  useEffect(() => {
    fetchExpensesStats()
  }, [])

  const fetchExpensesStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getExpensesStats()
      setExpensesData(response.data.expenses_by_category)
      setCurrentMonth(response.data.month)
    } catch (err) {
      console.error('Error fetching expenses stats:', err)
      setError('Error al cargar estadísticas de gastos')
      setExpensesData([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
        <CardDescription>
          {currentMonth ? `Distribución de gastos de ${currentMonth}` : 'Distribución de gastos del mes actual'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center text-red-500">
              <p className="font-medium">{error}</p>
              <button 
                onClick={fetchExpensesStats}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : expensesData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <p className="font-medium">No hay gastos registrados</p>
              <p className="text-sm">Los gastos del mes aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Gasto"]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--destructive))" 
                radius={[4, 4, 0, 0]}
                name="Gasto"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
