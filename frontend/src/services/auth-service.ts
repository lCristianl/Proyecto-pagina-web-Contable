// API Service for Django Session-based Authentication
// Handles authentication endpoints with session cookies

const API_BASE_URL = 'http://localhost:8000/api'

export interface LoginData {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  user: User
}

export interface ApiError {
  error: boolean
  message: string
  errors?: {
    username?: string[]
    password?: string[]
  }
}

export interface ForgotPasswordData {
  email: string
}

export interface VerifyCodeData {
  email: string
  code: string
}

export interface ResetPasswordData {
  email: string
  code: string
  new_password: string
}

export interface AuthCheckResponse {
  authenticated: boolean
  user?: User
}

class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  private csrfToken: string | null = null

  constructor() {
    if (AuthService.instance) {
      return AuthService.instance
    }
    AuthService.instance = this
    this.initializeCSRFToken()
  }

  private async initializeCSRFToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/csrf-token/`, {
        credentials: 'include'
      })
      const data = await response.json()
      this.csrfToken = data.csrf_token
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
    }
  }

  private async ensureCSRFToken() {
    if (!this.csrfToken) {
      await this.initializeCSRFToken()
    }
    return this.csrfToken
  }

  // Configurar fetch para incluir cookies y CSRF
  private async fetchWithCredentials(url: string, options: RequestInit = {}) {
    // Asegurar que tenemos el token CSRF para peticiones que lo requieren
    const needsCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())
    if (needsCSRF) {
      await this.ensureCSRFToken()
    }

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Incluir cookies en todas las peticiones
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    // Agregar token CSRF para peticiones que lo requieren
    if (needsCSRF && this.csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': this.csrfToken,
      }
    }

    const response = await fetch(url, config)
    return response
  }

  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await this.fetchWithCredentials(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw result as ApiError
      }

      this.currentUser = result.user
      return result as LoginResponse
    } catch (error) {
      if (error instanceof Error) {
        throw {
          error: true,
          message: error.message,
        } as ApiError
      }
      throw error
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchWithCredentials(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
      })

      const result = await response.json()
      
      if (response.ok) {
        this.currentUser = null
      }

      return result
    } catch (error) {
      this.currentUser = null
      if (error instanceof Error) {
        throw {
          error: true,
          message: error.message,
        } as ApiError
      }
      throw error
    }
  }

  async checkAuth(): Promise<AuthCheckResponse> {
    try {
      const response = await this.fetchWithCredentials(`${API_BASE_URL}/auth/check/`)
      const result = await response.json()

      if (result.authenticated) {
        this.currentUser = result.user
      } else {
        this.currentUser = null
      }

      return result
    } catch (error) {
      this.currentUser = null
      return { authenticated: false }
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchWithCredentials(`${API_BASE_URL}/auth/forgot-password/`, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw result as ApiError
      }

      return result
    } catch (error) {
      if (error instanceof Error) {
        throw {
          error: true,
          message: error.message,
        } as ApiError
      }
      throw error
    }
  }

  async verifyResetCode(data: VerifyCodeData): Promise<{ success: boolean; message: string; valid: boolean }> {
    try {
      const response = await this.fetchWithCredentials(`${API_BASE_URL}/auth/verify-code/`, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw result as ApiError
      }

      return result
    } catch (error) {
      if (error instanceof Error) {
        throw {
          error: true,
          message: error.message,
          valid: false,
        } as any
      }
      throw error
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchWithCredentials(`${API_BASE_URL}/auth/reset-password/`, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw result as ApiError
      }

      return result
    } catch (error) {
      if (error instanceof Error) {
        throw {
          error: true,
          message: error.message,
        } as ApiError
      }
      throw error
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // Método para hacer peticiones autenticadas (mantiene compatibilidad con el código existente)
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetchWithCredentials(url, options)
  }
}

export const authService = new AuthService()
export default authService
