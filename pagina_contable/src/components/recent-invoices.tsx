import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Pagada
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-gray-100">
            Pendiente
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Vencida
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturas Recientes</CardTitle>
        <CardDescription>Últimas facturas emitidas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentInvoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(invoice.status)}
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
