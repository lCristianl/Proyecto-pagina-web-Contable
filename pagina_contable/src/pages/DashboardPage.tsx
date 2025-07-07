import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DashboardStats } from "@/components/dashboard-stats"
import { SalesChart } from "@/components/sales-chart"
import { ExpensesChart } from "@/components/expenses-chart"
import { RecentInvoices } from "@/components/recent-invoices"

export function Dashboard() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Inicio</h1>
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
