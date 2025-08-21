import type React from "react"

// Authentication guard component for protecting routes
// Shows loading state while checking auth, redirects to login if not authenticated

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "./loading-spinner"
import { Card, CardContent } from "@/components/ui/card"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // Small delay to prevent flash of content
      const timer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Show loading state while checking authentication
  if (isLoading || !showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-sm text-muted-foreground">Verificando sesión...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show fallback or redirect to login if not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
    return null
  }

  // Show protected content
  return <>{children}</>
}
