import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface ClientsReportChartProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

const topClients = [
  { name: "Empresa ABC S.A.", revenue: 15000, invoices: 8 },
  { name: "Comercial XYZ Ltda.", revenue: 12000, invoices: 6 },
  { name: "Servicios DEF", revenue: 8000, invoices: 4 },
  { name: "Industrias GHI", revenue: 6000, invoices: 3 },
  { name: "Consultora JKL", revenue: 4000, invoices: 2 },
]

const clientsByType = [
  { name: "Empresas", value: 45, color: "#0088FE" },
  { name: "Particulares", value: 30, color: "#00C49F" },
  { name: "Gobierno", value: 15, color: "#FFBB28" },
  { name: "ONGs", value: 10, color: "#FF8042" },
]

export function ClientsReportChart({ dateRange }: ClientsReportChartProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Clientes por Ingresos</CardTitle>
          <CardDescription>Clientes que más ingresos generan</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topClients} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip formatter={(value) => [`$${value}`, "Ingresos"]} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes por Tipo</CardTitle>
          <CardDescription>Distribución de clientes por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clientsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {clientsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Estadísticas de Clientes</CardTitle>
          <CardDescription>
            Resumen del período {dateRange.startDate} - {dateRange.endDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-sm text-muted-foreground">Total Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15</div>
              <div className="text-sm text-muted-foreground">Nuevos Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$354</div>
              <div className="text-sm text-muted-foreground">Ingreso Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <div className="text-sm text-muted-foreground">Retención</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
