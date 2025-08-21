import { useState, useEffect } from "react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { ExpensesChart } from "@/components/dashboard/expenses-chart"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { ClipLoader } from "react-spinners"
import { Home } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"

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
      <PageLayout title="Inicio" icon={<Home className="h-5 w-5" />}>
        <div className="flex flex-col items-center justify-center h-screen">
          <ClipLoader color="#1400ff" size={80} />
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">Cargando...</h2>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Inicio" icon={<Home className="h-5 w-5" />}>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <DashboardStats />
        <div className="grid gap-4 md:grid-cols-2">
          <SalesChart />
          <ExpensesChart />
        </div>
        <RecentInvoices />
      </div>
    </PageLayout>
  )
}
