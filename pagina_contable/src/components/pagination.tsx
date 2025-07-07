import type React from "react"
;('"use client')

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = []
  const maxVisiblePages = 5

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center space-x-2">
      <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} />

      {pages.map((page) => (
        <PaginationItem key={page} active={currentPage === page} onClick={() => onPageChange(page)}>
          {page}
        </PaginationItem>
      ))}

      <PaginationNext onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} />
    </div>
  )
}

interface PaginationItemProps {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}

export function PaginationItem({ active, onClick, children }: PaginationItemProps) {
  return (
    <Button variant={active ? "default" : "outline"} size="sm" onClick={onClick}>
      {children}
    </Button>
  )
}

export function PaginationPrevious({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
      <ChevronLeft className="h-4 w-4" />
      Anterior
    </Button>
  )
}

export function PaginationNext({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
      Siguiente
      <ChevronRight className="h-4 w-4" />
    </Button>
  )
}

export function PaginationContent({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center space-x-2">{children}</div>
}

export const PaginationLink = PaginationItem

export function PaginationEllipsis() {
  return <span className="text-sm text-muted-foreground">...</span>
}
