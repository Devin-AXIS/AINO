import { DirectoryRepository } from "./repo";
export class DirectoryService {
    repo = new DirectoryRepository();
    async checkUserAccess(applicationId, userId) {
        try {
            const application = await this.repo.findApplicationById(applicationId);
            if (!application) {
                return false;
            }
            return application.ownerId === userId;
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
        const nameExists = await this.repo.checkNameExists(data.name, applicationId);
        if (nameExists) {
            throw new Error("目录名称已存在");
        }
        const result = await this.repo.create(data, applicationId, moduleId);
        console.log("创建目录成功:", result.id);
        return result;
    }
    async findMany(query, userId) {
        if (query.applicationId) {
            const hasAccess = await this.checkUserAccess(query.applicationId, userId);
            if (!hasAccess) {
                throw new Error("没有权限访问该应用");
            }
        }
        const result = await this.repo.findMany(query);
        console.log("查询目录列表成功，共", result.directories.length, "个目录");
        return result;
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
        console.log("查询目录详情成功:", result.id);
        return result;
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
        if (data.name && data.name !== existing.name) {
            const nameExists = await this.repo.checkNameExists(data.name, existing.applicationId, id);
            if (nameExists) {
                throw new Error("目录名称已存在");
            }
        }
        const result = await this.repo.update(id, data);
        console.log("更新目录成功:", result?.id);
        return result;
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
        const result = await this.repo.delete(id);
        console.log("删除目录成功:", result);
        return result;
    }
}
//# sourceMappingURL=service.js.map