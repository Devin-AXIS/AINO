import { db } from "../../db";
import { directories } from "../../db/schema";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
export class DirectoryRepository {
    async create(data) {
        const [directory] = await db
            .insert(directories)
            .values({
            applicationId: data.applicationId,
            moduleId: data.moduleId,
            name: data.name,
            type: data.type,
            supportsCategory: data.supportsCategory,
            config: data.config,
            order: data.order,
            isEnabled: true,
        })
            .returning();
        return directory;
    }
    async findMany(query) {
        const { page, limit, applicationId, moduleId, type, isEnabled } = query;
        const offset = (page - 1) * limit;
        const whereConditions = [];
        if (applicationId) {
            whereConditions.push(eq(directories.applicationId, applicationId));
        }
        if (moduleId) {
            whereConditions.push(eq(directories.moduleId, moduleId));
        }
        if (type) {
            whereConditions.push(eq(directories.type, type));
        }
        if (isEnabled !== undefined) {
            whereConditions.push(eq(directories.isEnabled, isEnabled));
        }
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
        const [{ value: total }] = await db
            .select({ value: count() })
            .from(directories)
            .where(whereClause);
        const dirs = await db
            .select({
            id: directories.id,
            applicationId: directories.applicationId,
            moduleId: directories.moduleId,
            name: directories.name,
            type: directories.type,
            supportsCategory: directories.supportsCategory,
            config: directories.config,
            order: directories.order,
            isEnabled: directories.isEnabled,
            createdAt: directories.createdAt,
            updatedAt: directories.updatedAt,
        })
            .from(directories)
            .where(whereClause)
            .orderBy(asc(directories.order), desc(directories.createdAt))
            .limit(limit)
            .offset(offset);
        return {
            directories: dirs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const [directory] = await db
            .select({
            id: directories.id,
            applicationId: directories.applicationId,
            moduleId: directories.moduleId,
            name: directories.name,
            type: directories.type,
            supportsCategory: directories.supportsCategory,
            config: directories.config,
            order: directories.order,
            isEnabled: directories.isEnabled,
            createdAt: directories.createdAt,
            updatedAt: directories.updatedAt,
        })
            .from(directories)
            .where(eq(directories.id, id))
            .limit(1);
        return directory;
    }
    async update(id, data) {
        const [directory] = await db
            .update(directories)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where(eq(directories.id, id))
            .returning();
        return directory;
    }
    async delete(id) {
        await db.delete(directories).where(eq(directories.id, id));
        return true;
    }
    async checkNameExists(name, applicationId, excludeId) {
        const conditions = [
            eq(directories.name, name),
            eq(directories.applicationId, applicationId)
        ];
        if (excludeId) {
            conditions.push(sql `${directories.id} != ${excludeId}`);
        }
        const [result] = await db
            .select()
            .from(directories)
            .where(and(...conditions))
            .limit(1);
        return !!result;
    }
}
//# sourceMappingURL=repo.js.map