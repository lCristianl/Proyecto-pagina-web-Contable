// Custom React hook for authentication state management
// Provides easy access to auth functions and user state

import { useState, useEffect, useCallback } from "react"
import { authService, type LoginData, type ForgotPasswordData, type User } from "@/services/auth-service"

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (request: ForgotPasswordData) => Promise<void>
  checkAuth: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticación al cargar
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await authService.checkAuth()
      if (response.authenticated && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize auth state on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (credentials: LoginData) => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      setUser(response.user)
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const forgotPassword = useCallback(async (request: ForgotPasswordData) => {
    await authService.forgotPassword(request)
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    forgotPassword,
    checkAuth,
  }
}
