import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/login/form-input"
import { LoadingSpinner } from "@/components/login/loading-spinner"
import { useToast } from "@/components/login/toast-notification"
import { useAuth } from "@/contexts/AuthContext"
import { authService, type ApiError } from "@/services/auth-service"
import { Calculator, Shield } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { addToast, ToastContainer } = useToast()
  const { login } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {}

    if (!formData.username.trim()) {
      newErrors.username = "El usuario es requerido"
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await login(formData.username, formData.password)

      addToast({
        type: "success",
        title: "¡Bienvenido!",
        message: "Has iniciado sesión correctamente",
      })

      // Redirigir al dashboard después del login exitoso
      window.location.href = '/dashboard'
    } catch (error) {
      const apiError = error as ApiError

      // Handle specific validation errors from Django
      if (apiError.errors && Object.keys(apiError.errors).length > 0) {
        const newErrors: { username?: string; password?: string } = {}

        if (apiError.errors.username) {
          newErrors.username = apiError.errors.username[0]
        }
        if (apiError.errors.password) {
          newErrors.password = apiError.errors.password[0]
        }

        setErrors(newErrors)
      }

      addToast({
        type: "error",
        title: "Error de autenticación",
        message: apiError.message || "Usuario o contraseña incorrectos",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showForgotPassword) {
    return <ForgotPasswordView onBack={() => setShowForgotPassword(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <ToastContainer />

      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Sistema Contable</h1>
          <p className="text-muted-foreground text-sm">Gestión profesional y segura para tu negocio</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-serif text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <FormInput
                label="Usuario"
                type="text"
                placeholder="Ingresa tu usuario"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                error={errors.username}
                disabled={isLoading}
                autoComplete="username"
              />

              <FormInput
                label="Contraseña"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={errors.password}
                disabled={isLoading}
                autoComplete="current-password"
              />

              <Button type="submit" className="w-full h-11 font-medium bg-blue-600 hover:bg-blue-700 cursor-pointer" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>Conexión segura y cifrada</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2024 Sistema Contable. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email')
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutos en segundos
  const { addToast, ToastContainer } = useToast()

  // Temporizador para el código
  useEffect(() => {
    if (step === 'code' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [step, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      addToast({
        type: "error",
        message: "Por favor ingresa tu correo electrónico",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      addToast({
        type: "error",
        message: "Por favor ingresa un correo electrónico válido",
      })
      return
    }

    setIsLoading(true)

    try {
      await authService.forgotPassword({ email })
      setStep('code')
      setTimeLeft(600) // Reiniciar timer
      addToast({
        type: "success",
        title: "Código enviado",
        message: "Revisa tu bandeja de entrada para obtener el código de verificación",
      })
    } catch (error) {
      const apiError = error as ApiError
      addToast({
        type: "error",
        message: apiError.message || "No se pudo enviar el código. Verifica que el email sea correcto.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim() || code.length !== 6) {
      addToast({
        type: "error",
        message: "Por favor ingresa el código de 6 dígitos",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await authService.verifyResetCode({ email, code })
      if (result.valid) {
        setStep('password')
        addToast({
          type: "success",
          message: "Código verificado correctamente",
        })
      }
    } catch (error) {
      const apiError = error as any
      addToast({
        type: "error",
        message: apiError.message || "Código inválido o expirado",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword.trim() || newPassword.length < 6) {
      addToast({
        type: "error",
        message: "La contraseña debe tener al menos 6 caracteres",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      addToast({
        type: "error",
        message: "Las contraseñas no coinciden",
      })
      return
    }

    setIsLoading(true)

    try {
      await authService.resetPassword({
        email,
        code,
        new_password: newPassword
      })
      setStep('success')
      addToast({
        type: "success",
        title: "¡Éxito!",
        message: "Tu contraseña ha sido cambiada correctamente",
      })
    } catch (error) {
      const apiError = error as ApiError
      addToast({
        type: "error",
        message: apiError.message || "Error al cambiar la contraseña",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <ToastContainer />

      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-serif text-center">
              {step === 'email' && "Recuperar Contraseña"}
              {step === 'code' && "Verificar Código"}
              {step === 'password' && "Nueva Contraseña"}
              {step === 'success' && "¡Listo!"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'email' && "Ingresa tu correo para recibir un código de verificación"}
              {step === 'code' && "Ingresa el código de 6 dígitos enviado a tu correo"}
              {step === 'password' && "Crea una nueva contraseña para tu cuenta"}
              {step === 'success' && "Tu contraseña ha sido cambiada exitosamente"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <FormInput
                  label="Correo Electrónico"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />

                <Button type="submit" className="w-full h-11 font-medium bg-blue-600 hover:bg-blue-700 cursor-pointer" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Enviando código...
                    </div>
                  ) : (
                    "Enviar Código"
                  )}
                </Button>

                <Button type="button" onClick={onBack} variant="ghost" className="w-full bg-transparent hover:bg-gray-300 cursor-pointer" disabled={isLoading}>
                  Volver al inicio de sesión
                </Button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="text-center space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Código enviado a: <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-sm text-red-600">
                    Expira en: {formatTime(timeLeft)}
                  </p>
                </div>

                <FormInput
                  label="Código de Verificación"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(value)
                  }}
                  disabled={isLoading || timeLeft <= 0}
                  autoComplete="one-time-code"
                  maxLength={6}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 font-medium bg-blue-600 hover:bg-blue-700 cursor-pointer" 
                  disabled={isLoading || timeLeft <= 0 || code.length !== 6}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Verificando...
                    </div>
                  ) : (
                    "Verificar Código"
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    onClick={() => {
                      setStep('email')
                      setCode('')
                      setTimeLeft(600)
                    }}  
                    className="flex-1 bg-transparent hover:bg-gray-300 cursor-pointer" 
                    disabled={isLoading}
                  >
                    Cambiar Email
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleSendCode} 
                    className="flex-1 bg-transparent hover:bg-green-500 cursor-pointer" 
                    disabled={isLoading}
                  >
                    Reenviar Código
                  </Button>
                </div>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <FormInput
                  label="Nueva Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />

                <FormInput
                  label="Confirmar Contraseña"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />

                <Button type="submit" className="w-full h-11 font-medium bg-blue-600 hover:bg-blue-700 cursor-pointer" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Cambiando contraseña...
                    </div>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </Button>

                <Button type="button" onClick={onBack} variant="ghost" className="w-full bg-transparent hover:bg-gray-300 cursor-pointer" disabled={isLoading}>
                  Cancelar
                </Button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Tu contraseña ha sido cambiada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <Button onClick={onBack} className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  Iniciar Sesión
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
