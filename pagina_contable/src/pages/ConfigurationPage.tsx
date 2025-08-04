import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Building, Bell, Shield, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ClipLoader } from "react-spinners"

export function ConfigurationPage() {
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [companyInfo, setCompanyInfo] = useState({
    name: "Mi Empresa S.A.",
    ruc: "1234567890001",
    address: "Av. Principal 123, Ciudad",
    phone: "+593 99 123 4567",
    email: "contacto@miempresa.com",
    website: "www.miempresa.com",
    logo: "",
  })

  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: "INV",
    nextNumber: "001",
    taxRate: "12",
    currency: "USD",
    paymentTerms: "30",
    footerText: "Gracias por su preferencia",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    invoiceReminders: true,
    paymentAlerts: true,
    reportAlerts: false,
  })

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "60",
    passwordExpiry: "90",
  })

  useEffect(() => {
    // Simular carga de componentes
    const timer = setTimeout(() => {
      setLoading(false)
    }, 100) 

    return () => clearTimeout(timer)
  }, [])

  const handleSaveCompanyInfo = () => {
    // Aquí implementarías la lógica para guardar la información de la empresa
    toast({
      title: "Éxito",
      description: "Información de la empresa actualizada correctamente",
    })
  }

  const handleSaveInvoiceSettings = () => {
    toast({
      title: "Éxito",
      description: "Configuración de facturación actualizada correctamente",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Éxito",
      description: "Configuración de notificaciones actualizada correctamente",
    })
  }

  const handleSaveSecurity = () => {
    toast({
      title: "Éxito",
      description: "Configuración de seguridad actualizada correctamente",
    })
  }

  if (loading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Configuración</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center h-screen">
          <ClipLoader color="#1400ff" size={80} />
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">Cargando...</h2>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Configuración</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="invoicing" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Facturación
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>
                  Configura los datos básicos de tu empresa que aparecerán en las facturas y reportes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                    <Input
                      id="companyName"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ruc">RUC *</Label>
                    <Input
                      id="ruc"
                      value={companyInfo.ruc}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, ruc: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Textarea
                    id="address"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logo">Logo de la Empresa</Label>
                  <Input id="logo" type="file" accept="image/*" />
                  <p className="text-sm text-muted-foreground">
                    Sube el logo de tu empresa (formato PNG, JPG, máximo 2MB)
                  </p>
                </div>
                <Button onClick={handleSaveCompanyInfo} className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer">Guardar Información</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoicing">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Facturación</CardTitle>
                <CardDescription>Personaliza el formato y comportamiento de tus facturas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prefix">Prefijo de Factura</Label>
                    <Input
                      id="prefix"
                      value={invoiceSettings.prefix}
                      onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, prefix: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nextNumber">Próximo Número</Label>
                    <Input
                      id="nextNumber"
                      value={invoiceSettings.nextNumber}
                      onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, nextNumber: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={invoiceSettings.currency}
                      onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={invoiceSettings.taxRate}
                      onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, taxRate: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentTerms">Términos de Pago (días)</Label>
                    <Input
                      id="paymentTerms"
                      type="number"
                      value={invoiceSettings.paymentTerms}
                      onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="footerText">Texto del Pie de Factura</Label>
                  <Textarea
                    id="footerText"
                    value={invoiceSettings.footerText}
                    onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, footerText: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveInvoiceSettings} className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer">Guardar Configuración</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Notificaciones</CardTitle>
                <CardDescription>Controla qué notificaciones quieres recibir y cómo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones generales por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Factura</Label>
                    <p className="text-sm text-muted-foreground">Notificar cuando una factura esté próxima a vencer</p>
                  </div>
                  <Switch
                    checked={notifications.invoiceReminders}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, invoiceReminders: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Pago</Label>
                    <p className="text-sm text-muted-foreground">Notificar cuando se reciba un pago</p>
                  </div>
                  <Switch
                    checked={notifications.paymentAlerts}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, paymentAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Reportes</Label>
                    <p className="text-sm text-muted-foreground">Recibir reportes automáticos semanales/mensuales</p>
                  </div>
                  <Switch
                    checked={notifications.reportAlerts}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, reportAlerts: checked }))}
                  />
                </div>
                <Button onClick={handleSaveNotifications} className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer">Guardar Configuración</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
                <CardDescription>Configura las opciones de seguridad para proteger tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                    <Select
                      value={security.sessionTimeout}
                      onValueChange={(value) => setSecurity((prev) => ({ ...prev, sessionTimeout: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="480">8 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passwordExpiry">Expiración de Contraseña (días)</Label>
                    <Select
                      value={security.passwordExpiry}
                      onValueChange={(value) => setSecurity((prev) => ({ ...prev, passwordExpiry: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                        <SelectItem value="never">Nunca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cambiar Contraseña</Label>
                  <div className="grid gap-2">
                    <Input type="password" placeholder="Contraseña actual" />
                    <Input type="password" placeholder="Nueva contraseña" />
                    <Input type="password" placeholder="Confirmar nueva contraseña" />
                  </div>
                </div>
                <Button onClick={handleSaveSecurity} className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer">Guardar Configuración</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
