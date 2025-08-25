import type { CreateDirectoryRequest, UpdateDirectoryRequest, GetDirectoriesQuery, DirectoryResponse, DirectoriesListResponse } from "./dto";
export declare class DirectoryService {
    private repo;
    private appRepo;
    private convertToResponse;
    checkUserAccess(applicationId: string, userId: string): Promise<boolean>;
    create(data: CreateDirectoryRequest, applicationId: string, moduleId: string, userId: string): Promise<DirectoryResponse>;
    findMany(query: GetDirectoriesQuery, userId: string): Promise<DirectoriesListResponse>;
    findById(id: string, userId: string): Promise<DirectoryResponse | null>;
    update(id: string, data: UpdateDirectoryRequest, userId: string): Promise<DirectoryResponse | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=service.d.ts.map