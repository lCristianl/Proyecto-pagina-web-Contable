import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Settings, ShoppingCart, Receipt } from "lucide-react"
import type { InventoryMovement } from "@/services/api"

interface InventoryMovementsProps {
  movements: InventoryMovement[]
  loading: boolean
}

export function InventoryMovements({ movements, loading }: InventoryMovementsProps) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return ShoppingCart
      case "sale":
        return Receipt
      case "adjustment":
        return Settings
      default:
        return ArrowUp
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "purchase":
        return "Compra"
      case "sale":
        return "Venta"
      case "adjustment":
        return "Ajuste"
      default:
        return "Desconocido"
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-800"
      case "sale":
        return "bg-blue-100 text-blue-800"
      case "adjustment":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Stock Anterior</TableHead>
              <TableHead>Stock Nuevo</TableHead>
              <TableHead>Motivo</TableHead>
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Stock Anterior</TableHead>
            <TableHead>Stock Nuevo</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No se encontraron movimientos de inventario
              </TableCell>
            </TableRow>
          ) : (
            movements.map((movement) => {
              const Icon = getMovementIcon(movement.movement_type)
              return (
                <TableRow key={movement.id}>
                  <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{movement.product.name}</TableCell>
                  <TableCell>
                    <Badge className={getMovementColor(movement.movement_type)}>
                      <Icon className="h-3 w-3 mr-1" />
                      {getMovementLabel(movement.movement_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {movement.new_stock > movement.previous_stock ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{Math.abs(movement.quantity)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{movement.previous_stock}</TableCell>
                  <TableCell className="font-medium">{movement.new_stock}</TableCell>
                  <TableCell className="max-w-xs truncate">{movement.reason || "-"}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
