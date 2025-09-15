import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Users } from "lucide-react"
import { ClientsTable } from "@/components/clients/clients-table"
import { ClientDialog } from "@/components/clients/client-dialog"
import { apiService, type Client } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { ClipLoader } from "react-spinners"
import { PageLayout } from "@/components/layout/PageLayout"

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
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
        className: "bg-red-700 text-white",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false) // Solo se ejecuta una vez
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
        className: "bg-green-700 text-white",
      })
      fetchClients()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
        className: "bg-red-700 text-white",
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
          className: "bg-green-700 text-white",
        })
      } else {
        await apiService.createClient(data)
        toast({
          title: "Éxito",
          description: "Cliente creado correctamente",
          className: "bg-green-700 text-white",
        })
      }
      setIsDialogOpen(false)
      fetchClients()
    } catch (error: any) {
      console.error('Error saving client:', error)
      
      // Determinar el mensaje de error más apropiado
      let errorMessage = "No se pudo guardar el cliente"
      
      if (error.type === 'validation' || error.type === 'field_validation') {
        if (error.message.includes('unique set') || error.message.includes('cedula')) {
          errorMessage = `Ya tienes un cliente registrado con la cédula: ${data.cedula || 'proporcionada'}`
        } else if (error.message.includes('RUC')) {
          errorMessage = `Ya tienes un cliente registrado con el RUC: ${data.ruc || 'proporcionado'}`
        } else {
          errorMessage = error.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        className: "bg-red-700 text-white",
      })
    }
  }

  // Usar initialLoading para el loader de pantalla completa
  if (initialLoading) {
    return (
      <PageLayout title="Clientes" icon={<Users className="h-5 w-5" />}>
        <div className="flex flex-col items-center justify-center h-screen">
          <ClipLoader color="#1400ff" size={80} />
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">Cargando...</h2>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Clientes" icon={<Users className="h-5 w-5" />}>
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
    </PageLayout>
  )
}
