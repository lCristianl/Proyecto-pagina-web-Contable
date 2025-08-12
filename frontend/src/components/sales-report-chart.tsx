import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface SalesReportChartProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

const salesData = [
  { month: "Ene", sales: 4000, invoices: 12 },
  { month: "Feb", sales: 3000, invoices: 8 },
  { month: "Mar", sales: 5000, invoices: 15 },
  { month: "Abr", sales: 4500, invoices: 13 },
  { month: "May", sales: 6000, invoices: 18 },
  { month: "Jun", sales: 5500, invoices: 16 },
]

const topProducts = [
  { name: "Laptop Dell", sales: 15000, quantity: 25 },
  { name: "Consultoría IT", sales: 12000, quantity: 80 },
  { name: "Soporte Técnico", sales: 8000, quantity: 40 },
  { name: "Desarrollo Web", sales: 6000, quantity: 12 },
]

export function SalesReportChart({ dateRange }: SalesReportChartProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Ventas</CardTitle>
          <CardDescription>Ventas mensuales en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`$${value}`, name === "sales" ? "Ventas" : "Facturas"]} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos/Servicios Más Vendidos</CardTitle>
          <CardDescription>Top productos por ingresos generados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`$${value}`, "Ventas"]} />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Resumen de Ventas</CardTitle>
          <CardDescription>
            Estadísticas del período {dateRange.startDate} - {dateRange.endDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$28,000</div>
              <div className="text-sm text-muted-foreground">Total Ventas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">82</div>
              <div className="text-sm text-muted-foreground">Facturas Emitidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$341</div>
              <div className="text-sm text-muted-foreground">Venta Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">+15%</div>
              <div className="text-sm text-muted-foreground">Crecimiento</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
