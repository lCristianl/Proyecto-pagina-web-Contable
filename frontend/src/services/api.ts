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
  private csrfToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.initializeCSRFToken()
  }

  private async initializeCSRFToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/csrf-token/`, {
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    // Asegurar que tenemos el token CSRF para peticiones que lo requieren
    const needsCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())
    if (needsCSRF) {
      await this.ensureCSRFToken()
    }

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: 'include', // Incluir cookies en todas las peticiones
      ...options,
    }

    // Agregar token CSRF para peticiones que lo requieren
    if (needsCSRF && this.csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': this.csrfToken,
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
        
        // Crear un error más detallado para manejar en el frontend
        const error = new Error() as any
        
        if (data && data.non_field_errors) {
          // Errores de validación de modelo (como unique_together)
          error.message = data.non_field_errors[0] || 'Error de validación'
          error.fieldErrors = data
          error.type = 'validation'
        } else if (data && data.ruc) {
          // Error específico del campo RUC
          error.message = Array.isArray(data.ruc) ? data.ruc[0] : data.ruc
          error.fieldErrors = data
          error.type = 'field_validation'
        } else if (data && data.cedula) {
          // Error específico del campo cédula
          error.message = Array.isArray(data.cedula) ? data.cedula[0] : data.cedula
          error.fieldErrors = data
          error.type = 'field_validation'
        } else if (data && (data.message || data.detail || data.error)) {
          error.message = data.message || data.detail || data.error
          error.fieldErrors = data
          error.type = 'api_error'
        } else {
          error.message = `HTTP error! status: ${response.status}`
          error.fieldErrors = data
          error.type = 'http_error'
        }
        
        if (data && data.errors) {
          console.error('Field errors:', data.errors);
        }
        
        // Mostrar todos los errores detallados
        console.error('Full error response:', data);
        
        throw error
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
    console.log('POST request data:', data); // Agregar logging
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

  // Proveedores
  async getSuppliers(page = 1, search = "") {
    return this.get<PaginatedResponse<Supplier>>(`/suppliers/?page=${page}&search=${search}`)
  }

  async getSupplier(id: number) {
    return this.get<Supplier>(`/suppliers/${id}/`)
  }

  async createSupplier(data: Partial<Supplier>) {
    return this.post<Supplier>("/suppliers/", data)
  }

  async updateSupplier(id: number, data: Partial<Supplier>) {
    return this.put<Supplier>(`/suppliers/${id}/`, data)
  }

  async deleteSupplier(id: number) {
    return this.delete(`/suppliers/${id}/`)
  }

  // Productos/Servicios
  async getProducts(page = 1, search = "") {
    return this.get<PaginatedResponse<Product>>(`/products/?page=${page}&search=${search}`)
  }

  async getProduct(id: number) {
    return this.get<Product>(`/products/${id}/`)
  }

  async getProductsWithStock(): Promise<ProductWithStock[]> {
    try {
      const response = await this.request<ProductWithStock[]>('/products/with-stock/', {
        method: 'GET'
      })
      return response.data
    } catch (error) {
      console.error('Error fetching products with stock:', error)
      throw error
    }
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

  // Inventario
  async getInventory(page = 1, search = "") {
    return this.get<PaginatedResponse<InventoryItem>>(`/inventory/?page=${page}&search=${search}`)
  }

  async getInventoryItem(id: number) {
    return this.get<InventoryItem>(`/inventory/${id}/`)
  }

  async updateInventory(id: number, data: Partial<InventoryItem>) {
    return this.put<InventoryItem>(`/inventory/${id}/`, data)
  }

  async updateProductLocation(data: UpdateProductLocationData) {
    return this.post<InventoryItem>("/inventory/location/", data)
  }

  async adjustInventory(data: InventoryAdjustment) {
    return this.post<InventoryMovement>("/inventory/adjustments/", data)
  }

  async getInventoryMovements(page = 1, productId?: number) {
    const params = new URLSearchParams({ page: page.toString() })
    if (productId) params.append("product", productId.toString())
    return this.get<PaginatedResponse<InventoryMovement>>(`/inventory-movements/?${params}`)
  }

  // Compras
  async getPurchases(page = 1, search = "") {
    return this.get<PaginatedResponse<Purchase>>(`/purchases/?page=${page}&search=${search}`)
  }

  async getPurchase(id: number) {
    return this.get<Purchase>(`/purchases/${id}/`)
  }

  async createPurchase(data: CreatePurchaseData) {
    return this.post<Purchase>("/purchases/", data)
  }

  async updatePurchase(id: number, data: CreatePurchaseData) {
    return this.put<Purchase>(`/purchases/${id}/`, data)
  }

  async deletePurchase(id: number) {
    return this.delete(`/purchases/${id}/`)
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

  // Dashboard y estadísticas
  async getDashboardStats() {
    return this.get<DashboardStats>("/dashboard/stats/")
  }

  async getExpensesStats() {
    return this.get<ExpensesStatsResponse>("/expenses/stats/")
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

export interface Supplier {
  id: number
  name: string
  ruc: string
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
  unit_weight?: number
  created_at: string
  updated_at: string
  // Campos adicionales para el inventario (solo se usan al crear)
  current_stock?: number
  minimum_stock?: number
  location?: string
}

export interface ProductWithStock {
  id: number
  name: string
  code: string
  price: number
  type: "product" | "service"
  description?: string
  unit_weight?: number
  created_at: string
  updated_at: string
  current_stock: number
  available: boolean
}

export interface InventoryItem {
  id: number
  product_id: number
  name: string
  code: string
  current_stock: number | string
  minimum_stock: number | string
  location: string
  last_movement_date: string
  created_at: string
  updated_at: string
  product: number
}

export interface InventoryMovement {
  id: number
  product: Product
  movement_type: "purchase" | "sale" | "adjustment"
  quantity: number
  previous_stock: number
  new_stock: number
  reason?: string
  date: string
  reference_id?: number
  created_at: string
}

export interface InventoryAdjustment {
  product_id: number
  quantity: number
  type: 'increase' | 'decrease'
  reason: string
  date: string
}

export interface UpdateProductLocationData {
  product_id: number
  location: string
}

export interface Purchase {
  id: number
  supplier: Supplier
  invoice_number: string
  date: string
  payment_method: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  items: PurchaseItem[]
  created_at: string
  updated_at: string
}

export interface PurchaseItem {
  id: number
  product: Product
  quantity: number
  unit_price: number
  total: number
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

export interface DashboardStats {
  monthlyRevenue: number
  monthlyExpenses: number
  netProfit: number
  pendingInvoices: number
}

export interface ExpenseByCategory {
  category: string
  amount: number
}

export interface ExpensesStatsResponse {
  expenses_by_category: ExpenseByCategory[]
  month: string
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

// Agregar tipo específico para crear compras
export interface CreatePurchaseData {
  supplier_id: number
  invoice_number?: string
  date: string
  payment_method: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  items: Array<{
    product_id: number
    quantity: number
    unit_price: number
    total: number
  }>
}

export const apiService = new ApiService(API_BASE_URL)
