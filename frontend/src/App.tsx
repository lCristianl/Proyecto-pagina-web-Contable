import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Dashboard } from "./pages/DashboardPage"
import { ClientsPage } from "./pages/ClientsPage"
import { ProductsPage } from "./pages/ProductsPage"
import { InvoicesPage } from "./pages/InvoicesPage"
import { ExpensesPage } from "./pages/ExpensesPage"
import { ConfigurationPage } from "./pages/ConfigurationPage"
import { ReportsPage } from "./pages/ReportsPage"

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppSidebar />  
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/facturas" element={<InvoicesPage />} />
            <Route path="/gastos" element={<ExpensesPage />} />
            <Route path="/reportes" element={<ReportsPage />} />
            <Route path="/configuracion" element={<ConfigurationPage />} />
          </Routes>
        </main>
        <Toaster />
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
