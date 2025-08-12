"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const expensesData = [
  { category: "Alquiler", amount: 2000 },
  { category: "Servicios", amount: 800 },
  { category: "Suministros", amount: 1200 },
  { category: "Marketing", amount: 600 },
  { category: "Otros", amount: 400 },
]

export function ExpensesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
        <CardDescription>Distribución de gastos del mes actual</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={expensesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, "Gasto"]} />
            <Bar dataKey="amount" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
