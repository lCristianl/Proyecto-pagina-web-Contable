import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from "recharts"

interface ProfitLossChartProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

const profitLossData = [
  { month: "Ene", revenue: 4000, expenses: 2800, profit: 1200 },
  { month: "Feb", revenue: 3000, expenses: 2200, profit: 800 },
  { month: "Mar", revenue: 5000, expenses: 3200, profit: 1800 },
  { month: "Abr", revenue: 4500, expenses: 2900, profit: 1600 },
  { month: "May", revenue: 6000, expenses: 3500, profit: 2500 },
  { month: "Jun", revenue: 5500, expenses: 3100, profit: 2400 },
]

export function ProfitLossChart({ dateRange }: ProfitLossChartProps) {
  const totalRevenue = profitLossData.reduce((sum, data) => sum + data.revenue, 0)
  const totalExpenses = profitLossData.reduce((sum, data) => sum + data.expenses, 0)
  const totalProfit = totalRevenue - totalExpenses
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% vs período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">-5% vs período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+25% vs período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground">+3.2% vs período anterior</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Ganancias y Pérdidas</CardTitle>
          <CardDescription>Comparación mensual de ingresos, gastos y ganancias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={profitLossData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  const labels = {
                    revenue: "Ingresos",
                    expenses: "Gastos",
                    profit: "Ganancia",
                  }
                  return [`$${value}`, labels[name as keyof typeof labels]]
                }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" name="revenue" />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="expenses" />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                name="profit"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
