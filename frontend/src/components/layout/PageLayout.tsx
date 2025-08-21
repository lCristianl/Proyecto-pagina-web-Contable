import { ReactNode } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserNav } from "@/components/ui/user-nav"
import { useNavigate } from "react-router-dom"

interface PageLayoutProps {
  children: ReactNode
  title: string
  icon: ReactNode
}

export function PageLayout({ children, title, icon }: PageLayoutProps) {
  const navigate = useNavigate()

  const handleNavigateToSettings = () => {
    navigate("/configuracion")
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2 flex-1">
          {icon}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <UserNav onNavigateToSettings={handleNavigateToSettings} />
      </header>
      {children}
    </SidebarInset>
  )
}
