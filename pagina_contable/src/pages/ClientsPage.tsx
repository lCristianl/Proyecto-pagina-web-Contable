import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { ClientsTable } from "@/components/clients-table"
import { ClientDialog } from "@/components/client-dialog"
import { apiService, type Client } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const { toast } = useToast()

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await apiService.getClients(page, search)
      setClients(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 10))
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [page, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreateClient = () => {
    setEditingClient(null)
    setIsDialogOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsDialogOpen(true)
  }

  const handleDeleteClient = async (id: number) => {
    try {
      await apiService.deleteClient(id)
      toast({
        title: "Éxito",
        description: "Cliente eliminado correctamente",
      })
      fetchClients()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    }
  }

  const handleSaveClient = async (data: Partial<Client>) => {
    try {
      if (editingClient) {
        await apiService.updateClient(editingClient.id, data)
        toast({
          title: "Éxito",
          description: "Cliente actualizado correctamente",
        })
      } else {
        await apiService.createClient(data)
        toast({
          title: "Éxito",
          description: "Cliente creado correctamente",
        })
      }
      setIsDialogOpen(false)
      fetchClients()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente",
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Clientes</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          <Button onClick={handleCreateClient} className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>

        <ClientsTable
          clients={clients}
          loading={loading}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <ClientDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          client={editingClient}
          onSave={handleSaveClient}
        />
      </div>
    </SidebarInset>
  )
}
