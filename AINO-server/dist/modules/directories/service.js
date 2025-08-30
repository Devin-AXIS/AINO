import { DirectoryRepository } from "./repo";
import { ApplicationRepository } from "../applications/repo";
export class DirectoryService {
    repo = new DirectoryRepository();
    appRepo = new ApplicationRepository();
    convertToResponse(dbRecord) {
        return {
            id: String(dbRecord.id),
            applicationId: String(dbRecord.applicationId),
            moduleId: String(dbRecord.moduleId),
            name: String(dbRecord.name),
            type: String(dbRecord.type),
            supportsCategory: Boolean(dbRecord.supportsCategory),
            config: dbRecord.config || {},
            order: Number(dbRecord.order || 0),
            isEnabled: Boolean(dbRecord.isEnabled),
            createdAt: dbRecord.createdAt instanceof Date ? dbRecord.createdAt.toISOString() : String(dbRecord.createdAt),
            updatedAt: dbRecord.updatedAt instanceof Date ? dbRecord.updatedAt.toISOString() : String(dbRecord.updatedAt),
        };
    }
    async checkUserAccess(applicationId, userId) {
        try {
            const application = await this.appRepo.findById(applicationId);
            if (!application) {
                return false;
            }
            if (application.ownerId === userId) {
                return true;
            }
            const member = await this.appRepo.findMember(applicationId, userId);
            return !!member;
        }
        catch (error) {
            console.error("检查用户权限失败:", error);
            return false;
        }
    }
    async create(data, applicationId, moduleId, userId) {
        const hasAccess = await this.checkUserAccess(applicationId, userId);
        if (!hasAccess) {
            throw new Error("没有权限访问该应用");
        }
        const exists = await this.repo.checkNameExists(data.name, applicationId);
        if (exists) {
            throw new Error("目录名称已存在");
        }
        try {
            const result = await this.repo.create({ ...data, applicationId, moduleId });
            return this.convertToResponse(result);
        }
        catch (error) {
            console.error("创建目录失败:", error);
            if (error instanceof Error && error.message.includes("foreign key")) {
                throw new Error("应用或模块不存在");
            }
            throw error;
        }
    }
    async findMany(query, userId) {
        if (query.applicationId) {
            const hasAccess = await this.checkUserAccess(query.applicationId, userId);
            if (!hasAccess) {
                throw new Error("没有权限访问该应用");
            }
        }
        const result = await this.repo.findMany(query);
        return {
            directories: result.directories.map(this.convertToResponse.bind(this)),
            pagination: result.pagination,
        };
    }
    async findById(id, userId) {
        const result = await this.repo.findById(id);
        if (!result) {
            return null;
        }
        const hasAccess = await this.checkUserAccess(result.applicationId, userId);
        if (!hasAccess) {
            throw new Error("没有权限访问该目录");
        }
        return this.convertToResponse(result);
    }
    async update(id, data, userId) {
        const existing = await this.repo.findById(id);
        if (!existing) {
            return null;
        }
        const hasAccess = await this.checkUserAccess(existing.applicationId, userId);
        if (!hasAccess) {
            throw new Error("没有权限修改该目录");
        }
        if (data.name) {
            const exists = await this.repo.checkNameExists(data.name, existing.applicationId, id);
            if (exists) {
                throw new Error("目录名称已存在");
            }
        }
        try {
            const result = await this.repo.update(id, data);
            return result ? this.convertToResponse(result) : null;
        }
        catch (error) {
            console.error("更新目录失败:", error);
            throw error;
        }
    }
    async delete(id, userId) {
        const existing = await this.repo.findById(id);
        if (!existing) {
            return false;
        }
        const hasAccess = await this.checkUserAccess(existing.applicationId, userId);
        if (!hasAccess) {
            throw new Error("没有权限删除该目录");
        }
        try {
            return await this.repo.delete(id);
        }
        catch (error) {
            console.error("删除目录失败:", error);
            if (error instanceof Error && error.message.includes("foreign key")) {
                throw new Error("目录正在被使用，无法删除");
            }
            throw error;
        }
    }
}
//# sourceMappingURL=service.js.map