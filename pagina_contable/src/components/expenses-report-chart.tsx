import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface ExpensesReportChartProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

const expensesByCategory = [
  { name: "Alquiler", value: 2000, color: "#0088FE" },
  { name: "Servicios", value: 800, color: "#00C49F" },
  { name: "Suministros", value: 1200, color: "#FFBB28" },
  { name: "Marketing", value: 600, color: "#FF8042" },
  { name: "Transporte", value: 400, color: "#8884D8" },
]

const monthlyExpenses = [
  { month: "Ene", amount: 4200 },
  { month: "Feb", amount: 3800 },
  { month: "Mar", amount: 4500 },
  { month: "Abr", amount: 4100 },
  { month: "May", amount: 5000 },
  { month: "Jun", amount: 4800 },
]

export function ExpensesReportChart({ dateRange }: ExpensesReportChartProps) {
  const totalExpenses = expensesByCategory.reduce((sum, expense) => sum + expense.value, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
          <CardDescription>Distribución de gastos en el período</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolución de Gastos</CardTitle>
          <CardDescription>Gastos mensuales en el período</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Gastos"]} />
              <Bar dataKey="amount" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
        </CardContent>
      </Card>
    </div>
  )
}
