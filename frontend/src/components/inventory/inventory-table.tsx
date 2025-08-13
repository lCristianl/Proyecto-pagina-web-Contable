import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Settings } from "lucide-react"
import type { InventoryItem } from "@/services/api"
import { Pagination } from "@/components/pagination"

interface InventoryTableProps {
  inventory: InventoryItem[]
  loading: boolean
  onAdjustStock: (item: InventoryItem) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function InventoryTable({
  inventory,
  loading,
  onAdjustStock,
  page,
  totalPages,
  onPageChange,
}: InventoryTableProps) {
  const getStockStatus = (current: number, minimum: number) => {
    if (current <= 0) {
      return { status: "Sin Stock", variant: "destructive" as const, icon: AlertTriangle }
    } else if (current <= minimum) {
      return { status: "Stock Bajo", variant: "secondary" as const, icon: AlertTriangle }
    } else {
      return { status: "Stock Normal", variant: "default" as const, icon: Package }
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicación</TableHead>
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
              <TableHead>Producto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron productos en inventario
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => {
                const stockStatus = getStockStatus(item.current_stock, item.minimum_stock)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{item.product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.product.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.current_stock}</TableCell>
                    <TableCell>{item.minimum_stock}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                        <stockStatus.icon className="h-3 w-3" />
                        {stockStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{item.location}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => onAdjustStock(item)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Ajustar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
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
