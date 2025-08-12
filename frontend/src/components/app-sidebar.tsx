"use client"
import { BarChart3, Calculator, FileText, Home, Package, Receipt, Settings, Users } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Productos/Servicios",
    url: "/productos",
    icon: Package,
  },
  {
    title: "Facturación",
    url: "/facturas",
    icon: FileText,
  },
  {
    title: "Gastos",
    url: "/gastos",
    icon: Receipt,
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-500 text-primary-foreground">
            <Calculator className="size-5 text-white" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">ContaApp</span>
            <span className="text-xs text-muted-foreground">Sistema Contable</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
