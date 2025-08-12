const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

class ApiService {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Agregar token de autenticación si existe
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      
      // Para operaciones DELETE exitosas (204 No Content), no intentar parsear JSON
      if (response.status === 204) {
        return {
          data: {} as T,
          status: response.status,
          message: 'Success',
        }
      }

      // Para respuestas exitosas sin contenido
      if (response.ok && response.status === 200) {
        const text = await response.text()
        if (!text.trim()) {
          return {
            data: {} as T,
            status: response.status,
            message: 'Success',
          }
        }
        // Si hay contenido, intentar parsearlo como JSON
        try {
          const data = JSON.parse(text)
          return {
            data,
            status: response.status,
            message: data.message,
          }
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError)
          return {
            data: {} as T,
            status: response.status,
            message: 'Success',
          }
        }
      }

      // Para el resto de respuestas, intentar parsear JSON
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        if (response.ok) {
          // Si la respuesta es exitosa pero no hay JSON válido
          return {
            data: {} as T,
            status: response.status,
            message: 'Success',
          }
        } else {
          // Si hay error y no se puede parsear JSON
          console.error('Error parsing error response:', jsonError)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      if (!response.ok) {
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          responseData: data,
        })
        
        throw new Error(data.message || data.detail || `HTTP error! status: ${response.status}`)
      }

      return {
        data,
        status: response.status,
        message: data.message,
      }
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Métodos CRUD genéricos
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // Métodos específicos para cada módulo

  // Clientes
  async getClients(page = 1, search = "") {
    return this.get<PaginatedResponse<Client>>(`/clients/?page=${page}&search=${search}`)
  }

  async getClient(id: number) {
    return this.get<Client>(`/clients/${id}/`)
  }

  async createClient(data: Partial<Client>) {
    return this.post<Client>("/clients/", data)
  }

  async updateClient(id: number, data: Partial<Client>) {
    return this.put<Client>(`/clients/${id}/`, data)
  }

  async deleteClient(id: number) {
    return this.delete(`/clients/${id}/`)
  }

  // Productos/Servicios
  async getProducts(page = 1, search = "") {
    return this.get<PaginatedResponse<Product>>(`/products/?page=${page}&search=${search}`)
  }

  async getProduct(id: number) {
    return this.get<Product>(`/products/${id}/`)
  }

  async createProduct(data: Partial<Product>) {
    return this.post<Product>("/products/", data)
  }

  async updateProduct(id: number, data: Partial<Product>) {
    return this.put<Product>(`/products/${id}/`, data)
  }

  async deleteProduct(id: number) {
    return this.delete(`/products/${id}/`)
  }

  // Facturas
  async getInvoices(page = 1, search = "") {
    return this.get<PaginatedResponse<Invoice>>(`/invoices/?page=${page}&search=${search}`)
  }

  async getInvoice(id: number) {
    return this.get<Invoice>(`/invoices/${id}/`)
  }

  async createInvoice(data: CreateInvoiceData | Partial<Invoice>) {
    return this.post<Invoice>("/invoices/", data)
  }

  async updateInvoice(id: number, data: Partial<Invoice>) {
    return this.put<Invoice>(`/invoices/${id}/`, data)
  }

  async deleteInvoice(id: number) {
    return this.delete(`/invoices/${id}/`)
  }

  // Gastos
  async getExpenses(page = 1, search = "") {
    return this.get<PaginatedResponse<Expense>>(`/expenses/?page=${page}&search=${search}`)
  }

  async getExpense(id: number) {
    return this.get<Expense>(`/expenses/${id}/`)
  }

  async createExpense(data: Partial<Expense>) {
    return this.post<Expense>("/expenses/", data)
  }

  async updateExpense(id: number, data: Partial<Expense>) {
    return this.put<Expense>(`/expenses/${id}/`, data)
  }

  async deleteExpense(id: number) {
    return this.delete(`/expenses/${id}/`)
  }
}

// Tipos de datos
export interface Client {
  id: number
  name: string
  cedula: string
  ruc?: string
  address: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  price: number
  type: "product" | "service"
  code: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: number
  client: Client
  invoice_number: string
  date: string
  due_date: string
  status: "draft" | "sent" | "paid" | "overdue"
  subtotal: number
  tax: number
  total: number
  items: InvoiceItem[]
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: number
  product: Product
  quantity: number
  unit_price: number
  total: number
}

export interface Expense {
  id: number
  category: string
  amount: number
  date: string
  description: string
  created_at: string
  updated_at: string
}

// Agregar tipo específico para crear facturas
export interface CreateInvoiceData {
  client_id: number
  invoice_number: string
  date: string
  due_date: string
  status: "draft" | "sent" | "paid" | "overdue"
  subtotal: number
  tax: number
  total: number
  items: {
    product_id: number
    quantity: number
    unit_price: number
    total: number
  }[]
}

export const apiService = new ApiService(API_BASE_URL)
