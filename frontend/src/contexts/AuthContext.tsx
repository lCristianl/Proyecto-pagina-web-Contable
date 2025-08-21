import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, type User } from '../services/auth-service'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  const checkAuth = async () => {
    // Evitar múltiples verificaciones simultáneas
    if (isLoading && hasCheckedAuth) {
      return
    }

    try {
      setIsLoading(true)
      
      // Tiempo mínimo para mostrar el loading (800ms)
      const [response] = await Promise.all([
        authService.checkAuth(),
        new Promise(resolve => setTimeout(resolve, 800))
      ])
      
      if (response.authenticated && response.user) {
        setUser(response.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setUser(null)
      // Aún así mantener el tiempo mínimo de loading
      await new Promise(resolve => setTimeout(resolve, 800))
    } finally {
      setIsLoading(false)
      setHasCheckedAuth(true)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Tiempo mínimo para mostrar el loading (500ms para login)
      const [response] = await Promise.all([
        authService.login({ username, password }),
        new Promise(resolve => setTimeout(resolve, 500))
      ])
      
      setUser(response.user)
    } catch (error) {
      // Aún así mantener el tiempo mínimo de loading
      await new Promise(resolve => setTimeout(resolve, 500))
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      
      // Tiempo mínimo para mostrar el loading (400ms para logout)
      await Promise.all([
        authService.logout(),
        new Promise(resolve => setTimeout(resolve, 400))
      ])
      
      setUser(null)
    } catch (error) {
      console.error('Error during logout:', error)
      // Limpiar el estado local aunque falle la llamada al servidor
      await new Promise(resolve => setTimeout(resolve, 400))
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Solo verificar auth una vez al montar el componente
    if (!hasCheckedAuth) {
      checkAuth()
    }
  }, [hasCheckedAuth])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
