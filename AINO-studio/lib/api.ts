// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 用户相关类型
export interface User {
  id: string
  email: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// 应用相关类型
export interface Application {
  id: string
  name: string
  description: string
  slug: string
  ownerId: string
  status: string
  template: string
  config: Record<string, any>
  databaseConfig: any
  isPublic: boolean
  version: string
  createdAt: string
  updatedAt: string
}

export interface CreateApplicationRequest {
  name: string
  description?: string
  template?: string
  isPublic?: boolean
  config?: Record<string, any>
}

export interface ApplicationsListResponse {
  applications: Application[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApplicationModule {
  id: string
  applicationId: string
  name: string
  type: string
  icon: string
  config: any
  order: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ApplicationWithModules {
  application: Application
  modules: ApplicationModule[]
}

// 通用 API 请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`)
    console.log(`📋 Request Config:`, {
      url: `${API_BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      headers: config.headers,
      body: options.body ? JSON.parse(options.body as string) : undefined
    })
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    console.log(`📡 Response Status:`, response.status)
    console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()))
    
    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    console.log(`📡 Content-Type:`, contentType)
    
    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.log(`📡 Response Text:`, text)
      try {
        data = JSON.parse(text)
      } catch {
        data = { error: text }
      }
    }
    
    console.log(`📡 Response Data:`, data)
    
    // 处理成功状态码 (200, 201, 204 等)
    if (response.ok) {
      return data
    } else {
      // 处理错误状态码
      console.error(`❌ HTTP Error: ${response.status}`, data)
      throw new Error(data.error || data.message || `HTTP ${response.status}`)
    }
  } catch (error) {
    console.error(`❌ API Error:`, error)
    console.error(`❌ Error Details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      endpoint,
      options
    })
    throw error
  }
}

// 认证相关 API
export const authApi = {
  // 用户登录
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiRequest<LoginResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  // 获取当前用户信息（暂时使用 mock）
  async getCurrentUser(): Promise<ApiResponse<User>> {
    // 暂时返回 mock 数据，等后端实现
    return Promise.resolve({
      success: true,
      data: {
        id: 'u-1',
        email: 'admin@aino.com',
        name: 'Admin'
      }
    })
  }
}

// 应用相关 API
export const applicationsApi = {
  // 获取应用列表
  async getApplications(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    template?: string
  }): Promise<ApiResponse<ApplicationsListResponse>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = `/api/applications${queryString ? `?${queryString}` : ''}`
    
    return apiRequest<ApplicationsListResponse>(endpoint)
  },

  // 创建应用
  async createApplication(data: CreateApplicationRequest): Promise<ApiResponse<Application>> {
    return apiRequest<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 获取应用详情
  async getApplication(id: string): Promise<ApiResponse<Application>> {
    return apiRequest<Application>(`/api/applications/${id}`)
  },

  // 更新应用
  async updateApplication(id: string, data: Partial<CreateApplicationRequest>): Promise<ApiResponse<Application>> {
    return apiRequest<Application>(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除应用
  async deleteApplication(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/applications/${id}`, {
      method: 'DELETE',
    })
  },

  // 获取应用的模块列表
  async getApplicationModules(id: string): Promise<ApiResponse<ApplicationWithModules>> {
    return apiRequest<ApplicationWithModules>(`/api/applications/${id}/modules`)
  }
}

// 目录相关 API
export const directoriesApi = {
  // 获取目录列表
  async getDirectories(params: {
    applicationId: string
    moduleId?: string
    type?: string
    isEnabled?: boolean
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/api/directories${queryString ? `?${queryString}` : ''}`
    
    return apiRequest<any>(endpoint)
  },

  // 创建目录
  async createDirectory(data: {
    name: string
    type: string
    supportsCategory: boolean
    config: any
    order: number
  }, params: {
    applicationId: string
    moduleId: string
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/api/directories${queryString ? `?${queryString}` : ''}`
    
    return apiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新目录
  async updateDirectory(id: string, data: Partial<{
    name: string
    type: string
    supportsCategory: boolean
    config: any
    order: number
    isEnabled: boolean
  }>): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/directories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除目录
  async deleteDirectory(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest<{ success: boolean }>(`/api/directories/${id}`, {
      method: 'DELETE',
    })
  },

  // 获取目录详情
  async getDirectory(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/directories/${id}`)
  }
}

// 导出默认 API 对象
export const api = {
  auth: authApi,
  applications: applicationsApi,
  directories: directoriesApi,
}
