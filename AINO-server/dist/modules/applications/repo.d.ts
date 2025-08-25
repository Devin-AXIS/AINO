import type { CreateApplicationRequest, UpdateApplicationRequest, GetApplicationsQuery } from "./dto";
export declare class ApplicationRepository {
    create(data: CreateApplicationRequest & {
        ownerId: string;
    }): Promise<any>;
    findMany(query: GetApplicationsQuery & {
        userId: string;
    }): Promise<{
        applications: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    findById(id: string, userId: string): Promise<any>;
    update(id: string, data: UpdateApplicationRequest, userId: string): Promise<any>;
    delete(id: string, userId: string): Promise<boolean>;
    findMember(applicationId: string, userId: string): Promise<any>;
    private generateSlug;
}
//# sourceMappingURL=repo.d.ts.map