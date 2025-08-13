"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService } from "@/services/api"

interface DashboardData {
  monthlyRevenue: number
  monthlyExpenses: number
  netProfit: number
  pendingInvoices: number
}

export function DashboardStats() {
  const [data, setData] = useState<DashboardData>({
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    pendingInvoices: 0,
  })
  const [loading, setLoading] = useState(true)

  // Función helper para formatear números de forma segura
  const formatCurrency = (value: number | null | undefined): string => {
    const numValue = typeof value === 'number' ? value : 0
    return numValue.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'USD'
    })
  }

  const formatNumber = (value: number | null | undefined): string => {
    const numValue = typeof value === 'number' ? value : 0
    return numValue.toString()
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiService.get<DashboardData>("/dashboard/stats/")
        
        // Validar y normalizar los datos recibidos
        const normalizedData = {
          monthlyRevenue: Number(response.data?.monthlyRevenue) || 0,
          monthlyExpenses: Number(response.data?.monthlyExpenses) || 0,
          netProfit: Number(response.data?.netProfit) || 0,
          pendingInvoices: Number(response.data?.pendingInvoices) || 0,
        }
        
        //console.log('Dashboard data received:', normalizedData)
        setData(normalizedData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // Datos de ejemplo para demostración
        setData({
          monthlyRevenue: 45231.89,
          monthlyExpenses: 12345.67,
          netProfit: 32886.22,
          pendingInvoices: 8,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const stats = [
    {
      title: "Ventas del Mes",
      value: formatCurrency(data.monthlyRevenue),
      description: "+20.1% respecto al mes anterior",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Gastos del Mes",
      value: formatCurrency(data.monthlyExpenses),
      description: "-5.2% respecto al mes anterior",
      icon: TrendingDown,
      trend: "down",
    },
    {
      title: "Ganancia Neta",
      value: formatCurrency(data.netProfit),
      description: "+12.5% respecto al mes anterior",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Facturas Pendientes",
      value: formatNumber(data.pendingInvoices),
      description: "Por cobrar este mes",
      icon: FileText,
      trend: "neutral",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-40 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.trend === "up"
                  ? "text-green-600"
                  : stat.trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
