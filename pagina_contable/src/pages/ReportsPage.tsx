import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, Download, Calendar, TrendingUp } from "lucide-react"
import { SalesReportChart } from "@/components/sales-report-chart"
import { ExpensesReportChart } from "@/components/expenses-report-chart"
import { ProfitLossChart } from "@/components/profit-loss-chart"
import { ClientsReportChart } from "@/components/clients-report-chart"
import { ClipLoader } from "react-spinners"

export function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], // Inicio del año
    endDate: new Date().toISOString().split("T")[0], // Hoy
  })

  useEffect(() => {
    // Simular carga de componentes
    const timer = setTimeout(() => {
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  const handleExportReport = (reportType: string) => {
    // Aquí implementarías la lógica para exportar reportes
    console.log(`Exportando reporte: ${reportType}`)
  }

  if (loading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Reportes</h1>
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
          <BarChart3 className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Reportes</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Filtros de fecha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtros de Fecha
            </CardTitle>
            <CardDescription>Selecciona el rango de fechas para generar los reportes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Fecha Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Fecha Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <Button variant="outline" className="bg-yellow-400 hover:bg-yellow-500 cursor-pointer">
                <TrendingUp className="mr-2 h-4 w-4" />
                Actualizar Reportes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de reportes */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="profit">Ganancias</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reporte de Ventas</h2>
              <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={() => handleExportReport("sales")}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
            <SalesReportChart dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reporte de Gastos</h2>
              <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={() => handleExportReport("expenses")}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
            <ExpensesReportChart dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="profit" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reporte de Ganancias y Pérdidas</h2>
              <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={() => handleExportReport("profit")}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
            <ProfitLossChart dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reporte de Clientes</h2>
              <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={() => handleExportReport("clients")}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
            <ClientsReportChart dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
