import type { CreateDirectoryRequest, UpdateDirectoryRequest, GetDirectoriesQuery } from "./dto";
export declare class DirectoryRepository {
    create(data: CreateDirectoryRequest & {
        applicationId: string;
        moduleId: string;
    }): Promise<{
        type: string;
        id: string;
        name: string;
        config: unknown;
        createdAt: Date;
        updatedAt: Date;
        applicationId: string;
        order: number | null;
        isEnabled: boolean | null;
        moduleId: string;
        supportsCategory: boolean | null;
    }>;
    findMany(query: GetDirectoriesQuery): Promise<{
        directories: {
            id: string;
            applicationId: string;
            moduleId: string;
            name: string;
            type: string;
            supportsCategory: boolean | null;
            config: unknown;
            order: number | null;
            isEnabled: boolean | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        id: string;
        applicationId: string;
        moduleId: string;
        name: string;
        type: string;
        supportsCategory: boolean | null;
        config: unknown;
        order: number | null;
        isEnabled: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdateDirectoryRequest): Promise<{
        id: string;
        applicationId: string;
        moduleId: string;
        name: string;
        type: string;
        supportsCategory: boolean | null;
        config: unknown;
        order: number | null;
        isEnabled: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<boolean>;
    checkNameExists(name: string, applicationId: string, excludeId?: string): Promise<boolean>;
}
//# sourceMappingURL=repo.d.ts.map