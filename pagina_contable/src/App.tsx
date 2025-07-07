import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Dashboard } from "./pages/DashboardPage"
import { ClientsPage } from "./pages/ClientsPage"

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppSidebar />  
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<ClientsPage />} />
          </Routes>
        </main>
        <Toaster />
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
