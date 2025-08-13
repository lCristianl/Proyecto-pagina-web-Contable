"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Mail, Phone } from "lucide-react"
import type { Client } from "@/services/api"
import { Pagination } from "@/components/pagination"

interface ClientsTableProps {
  clients: Client[]
  loading: boolean
  onEdit: (client: Client) => void
  onDelete: (id: number) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ClientsTable({
  clients = [],
  loading,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
}: ClientsTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.cedula}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.ruc || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{client.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="bg-yellow-400 hover:bg-yellow-500 cursor-pointer" onClick={() => onEdit(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(client.id)}
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
    </div>
  )
}
