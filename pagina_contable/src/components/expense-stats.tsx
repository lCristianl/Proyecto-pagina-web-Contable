import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, Calendar, DollarSign, Tag } from "lucide-react"
import type { Expense } from "@/services/api"

interface ExpenseStatsProps {
  expenses: Expense[]
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  const totalMonthly = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageExpense = monthlyExpenses.length > 0 ? totalMonthly / monthlyExpenses.length : 0

  const categories = [...new Set(expenses.map((expense) => expense.category))]
  const topCategory = categories.reduce(
    (top, category) => {
      const categoryTotal = expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0)
      return categoryTotal > top.amount ? { category, amount: categoryTotal } : top
    },
    { category: "N/A", amount: 0 },
  )

  const stats = [
    {
      title: "Gastos del Mes",
      value: `$${totalMonthly.toLocaleString()}`,
      description: `${monthlyExpenses.length} gastos registrados`,
      icon: DollarSign,
    },
    {
      title: "Promedio por Gasto",
      value: `$${averageExpense.toFixed(2)}`,
      description: "Gasto promedio mensual",
      icon: TrendingDown,
    },
    {
      title: "Categoría Principal",
      value: topCategory.category,
      description: `$${topCategory.amount.toFixed(2)} total`,
      icon: Tag,
    },
    {
      title: "Total de Categorías",
      value: categories.length.toString(),
      description: "Categorías diferentes",
      icon: Calendar,
    },
  ]

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
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
