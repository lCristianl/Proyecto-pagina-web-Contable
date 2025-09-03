import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Download } from "lucide-react"
import type { Invoice } from "@/services/api"
import { Pagination } from "@/components/pagination"
import { InvoiceDetailsDialog } from "./invoice-details-dialog"

interface InvoicesTableProps {
  invoices: Invoice[]
  loading: boolean
  onEdit: (invoice: Invoice) => void
  onDelete: (id: number) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function InvoicesTable({
  invoices = [], // Valor por defecto
  loading,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
}: InvoicesTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailsDialogOpen(true)
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

  // Validación adicional
  const safeInvoices = Array.isArray(invoices) ? invoices : []

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(7)].map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron facturas
                </TableCell>
              </TableRow>
            ) : (
              safeInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.client?.name || 'Sin cliente'}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="font-medium">${Number(invoice.total || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-blue-400 hover:bg-blue-500 cursor-pointer"
                        onClick={() => handleViewDetails(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="bg-green-400 hover:bg-green-500 cursor-pointer">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="bg-yellow-400 hover:bg-yellow-500 cursor-pointer" onClick={() => onEdit(invoice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(invoice.id)}
                        className="text-destructive hover:text-destructive bg-red-500 hover:bg-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
      
      <InvoiceDetailsDialog 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen} 
        invoice={selectedInvoice} 
      />
    </div>
  )
}
