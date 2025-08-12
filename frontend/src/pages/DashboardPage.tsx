import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DashboardStats } from "@/components/dashboard-stats"
import { SalesChart } from "@/components/sales-chart"
import { ExpensesChart } from "@/components/expenses-chart"
import { RecentInvoices } from "@/components/recent-invoices"
import { ClipLoader } from "react-spinners"
import { Home } from "lucide-react"

export function Dashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de componentes
    const timer = setTimeout(() => {
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Inicio</h1>
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
          <Home className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Inicio</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <DashboardStats />
        <div className="grid gap-4 md:grid-cols-2">
          <SalesChart />
          <ExpensesChart />
        </div>
        <RecentInvoices />
      </div>
    </SidebarInset>
  )
}
