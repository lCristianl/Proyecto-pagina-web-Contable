import { useAuth } from '@/contexts/AuthContext'
import { ClipLoader } from 'react-spinners'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ClipLoader color="#1400ff" size={80} />
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">Verificando sesión...</h2>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    window.location.href = '/login'
    return null
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>
}
