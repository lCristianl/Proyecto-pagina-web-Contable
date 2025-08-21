import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

interface UserNavProps {
  onNavigateToSettings: () => void
}

export function UserNav({ onNavigateToSettings }: UserNavProps) {
  const { toast } = useToast()
  const { user, logout } = useAuth()

  if (!user) {
    return null // No mostrar el componente si no hay usuario autenticado
  }

  const handleProfileConfig = () => {
    toast({
      title: "Configurar Perfil",
      description: "Funcionalidad próximamente disponible",
      className: "bg-blue-600 text-white",
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
        className: "bg-green-600 text-white",
      })
      // Redirigir al login
      window.location.href = '/login'
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      })
    }
  }

  // Obtener las iniciales del nombre para el fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Construir el nombre completo
  const fullName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.first_name || user.username

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={fullName} />
            <AvatarFallback className="bg-blue-600 text-white">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileConfig} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Configurar Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNavigateToSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
