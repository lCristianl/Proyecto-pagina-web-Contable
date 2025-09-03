import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Printer } from "lucide-react"
import { type Invoice } from "@/services/api"

interface InvoiceDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}

export function InvoiceDetailsDialog({ open, onOpenChange, invoice }: InvoiceDetailsDialogProps) {
  if (!invoice) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
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

  // Función auxiliar para formatear peso
  const formatWeight = (weight: any): string => {
    const numWeight = parseFloat(String(weight || 0))
    return isNaN(numWeight) || numWeight === 0 ? '-' : `${numWeight.toFixed(3)} kg`
  }

  // Función auxiliar para calcular peso total de un item
  const calculateItemWeight = (quantity: number, unitWeight: any): string => {
    const numWeight = parseFloat(String(unitWeight || 0))
    if (isNaN(numWeight) || numWeight === 0) return '-'
    return `${(numWeight * quantity).toFixed(3)} kg`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Factura #{invoice.invoice_number}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1 bg-yellow-300 hover:bg-yellow-400 cursor-pointer">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 bg-green-400 hover:bg-green-500 cursor-pointer">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Descargar</span>
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detalles completos de la factura emitida el {formatDate(invoice.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-semibold">{invoice.client.name}</p>
                <p>Cédula: {invoice.client.cedula}</p>
                <p>RUC: {invoice.client.ruc || <span className="text-muted-foreground">Sin RUC</span>}</p>
                <p>{invoice.client.address}</p>
                <p>{invoice.client.email}</p>
                <p>{invoice.client.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Información de Factura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Número:</p>
                  <p className="font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado:</p>
                  <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha de emisión:</p>
                  <p className="font-medium">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha de vencimiento:</p>
                  <p className="font-medium">{formatDate(invoice.due_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Detalle de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">Peso Unit.</TableHead>
                  <TableHead className="text-right">Peso Total</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatWeight(item.product.unit_weight)}
                    </TableCell>
                    <TableCell className="text-right">
                      {calculateItemWeight(item.quantity, item.product.unit_weight)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 items-end mt-4">
          <div className="flex justify-between w-1/2 text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between w-1/2 text-sm">
            <span>IVA (12%):</span>
            <span className="font-medium">{formatCurrency(invoice.tax)}</span>
          </div>
          <Separator className="my-2 w-1/2" />
          <div className="flex justify-between w-1/2 text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button className="bg-red-500 text-white hover:bg-red-700 cursor-pointer" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
