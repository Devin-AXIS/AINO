import { DirectoryRepository } from "./repo"
import type {
  CreateDirectoryRequest,
  UpdateDirectoryRequest,
  GetDirectoriesQuery,
  DirectoryResponse,
  DirectoriesListResponse,
} from "./dto"

export class DirectoryService {
  private repo = new DirectoryRepository()

  // 检查用户是否有权限访问应用
  async checkUserAccess(applicationId: string, userId: string): Promise<boolean> {
    try {
      // 简化权限检查：只有应用所有者可以访问
      const application = await this.repo.findApplicationById(applicationId)
      if (!application) {
        return false
      }
      
      // 检查是否是应用所有者
      return application.ownerId === userId
    } catch (error) {
      console.error("检查用户权限失败:", error)
      return false
    }
  }

  async create(data: CreateDirectoryRequest, applicationId: string, moduleId: string, userId: string): Promise<DirectoryResponse> {
    // 验证用户权限
    const hasAccess = await this.checkUserAccess(applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限访问该应用")
    }

    // 检查名称是否已存在
    const nameExists = await this.repo.checkNameExists(data.name, applicationId)
    if (nameExists) {
      throw new Error("目录名称已存在")
    }

    const result = await this.repo.create(data, applicationId, moduleId)
    console.log("创建目录成功:", result.id)
    return result
  }

  async findMany(query: GetDirectoriesQuery, userId: string): Promise<DirectoriesListResponse> {
    // 如果指定了应用ID，验证用户权限
    if (query.applicationId) {
      const hasAccess = await this.checkUserAccess(query.applicationId, userId)
      if (!hasAccess) {
        throw new Error("没有权限访问该应用")
      }
    }

    const result = await this.repo.findMany(query)
    console.log("查询目录列表成功，共", result.directories.length, "个目录")
    return result
  }

  async findById(id: string, userId: string): Promise<DirectoryResponse | null> {
    const result = await this.repo.findById(id)
    if (!result) {
      return null
    }

    // 验证用户权限
    const hasAccess = await this.checkUserAccess(result.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限访问该目录")
    }

    console.log("查询目录详情成功:", result.id)
    return result
  }

  async update(id: string, data: UpdateDirectoryRequest, userId: string): Promise<DirectoryResponse | null> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      return null
    }

    // 验证用户权限
    const hasAccess = await this.checkUserAccess(existing.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限修改该目录")
    }

    // 检查名称是否已存在（排除当前目录）
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.repo.checkNameExists(data.name, existing.applicationId, id)
      if (nameExists) {
        throw new Error("目录名称已存在")
      }
    }

    const result = await this.repo.update(id, data)
    console.log("更新目录成功:", result?.id)
    return result
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      return false
    }

    // 验证用户权限
    const hasAccess = await this.checkUserAccess(existing.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限删除该目录")
    }

    const result = await this.repo.delete(id)
    console.log("删除目录成功:", result)
    return result
  }
}
