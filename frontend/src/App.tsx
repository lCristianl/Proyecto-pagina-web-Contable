import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Dashboard } from "./pages/DashboardPage"
import { ClientsPage } from "./pages/ClientsPage"
import { SuppliersPage } from "./pages/SuppliersPage"
import { ProductsPage } from "./pages/ProductsPage"
import { InventoryPage } from "./pages/InventoryPage"
import { PurchasesPage } from "./pages/PurchasesPage"
import { InvoicesPage } from "./pages/InvoicesPage"
import { ExpensesPage } from "./pages/ExpensesPage"
import { ConfigurationPage } from "./pages/ConfigurationPage"
import { ReportsPage } from "./pages/ReportsPage"
import LoginPage from "./pages/LoginPage"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <SidebarProvider>
                <AppSidebar />  
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clientes" element={<ClientsPage />} />
                    <Route path="/proveedores" element={<SuppliersPage />} />
                    <Route path="/productos" element={<ProductsPage />} />
                    <Route path="/inventario" element={<InventoryPage />} />
                    <Route path="/compras" element={<PurchasesPage />} />
                    <Route path="/facturas" element={<InvoicesPage />} />
                    <Route path="/gastos" element={<ExpensesPage />} />
                    <Route path="/reportes" element={<ReportsPage />} />
                    <Route path="/configuracion" element={<ConfigurationPage />} />
                  </Routes>
                </main>
                <Toaster />
              </SidebarProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
