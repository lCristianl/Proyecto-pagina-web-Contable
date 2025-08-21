// Generic API client for making requests to Django REST API
// Provides base functionality for all API services

import { authService } from "./auth-service"

interface ApiClientConfig {
  baseUrl?: string
  timeout?: number
}

class ApiClient {
  private baseUrl: string
  private timeout: number

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
    this.timeout = config.timeout || 10000 // 10 seconds default timeout
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, authenticated = false): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    if (authenticated) {
      const response = await authService.authenticatedRequest(url, {
        method: "GET",
      })
      return this.handleResponse<T>(response)
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: any, authenticated = false): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    if (authenticated) {
      const response = await authService.authenticatedRequest(url, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      })
      return this.handleResponse<T>(response)
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: any, authenticated = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await authService.authenticatedRequest(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, authenticated = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await authService.authenticatedRequest(url, {
      method: "DELETE",
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status,
        errors: errorData.errors || {},
      }
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances if needed
export { ApiClient }
