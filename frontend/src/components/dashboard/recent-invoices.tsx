import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { apiService, type Invoice } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { InvoiceDetailsDialog } from "../invoices/invoice-details-dialog"

const recentInvoices = [
  {
    id: "INV-001",
    client: "Empresa ABC S.A.",
    amount: 1250.0,
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "INV-002",
    client: "Comercial XYZ Ltda.",
    amount: 890.5,
    status: "paid",
    date: "2024-01-14",
  },
  {
    id: "INV-003",
    client: "Servicios DEF",
    amount: 2100.75,
    status: "overdue",
    date: "2024-01-10",
  },
]

export function RecentInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecentInvoices()
  }, [])

  const fetchRecentInvoices = async () => {
    try {
      setLoading(true)
      const response = await apiService.getInvoices(1, '')
      // Tomamos solo las 5 facturas más recientes
      const recentInvoices = response.data.results.slice(0, 5)
      setInvoices(recentInvoices)
    } catch (error) {
      console.error("Error fetching recent invoices:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas recientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Borrador</Badge>
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "sent":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Enviada</Badge>
      case "paid":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Pagada</Badge>
      case "overdue":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Vencida</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }
  
  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailsDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturas Recientes</CardTitle>
        <CardDescription>Últimas facturas emitidas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            // Skeleton loader durante la carga
            [...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))
          ) : invoices.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              No hay facturas recientes disponibles
            </div>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.client.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(invoice.total).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(invoice.status)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-400 hover:bg-blue-500 cursor-pointer"
                    onClick={() => handleViewDetails(invoice)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      {/* Diálogo para mostrar detalles de la factura */}
      <InvoiceDetailsDialog 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen} 
        invoice={selectedInvoice} 
      />
    </Card>
  )
}
