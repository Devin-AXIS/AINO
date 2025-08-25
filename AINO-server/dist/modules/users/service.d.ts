import type { TLoginReq } from "./dto";
export declare function loginSvc(body: TLoginReq): Promise<{
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}>;
//# sourceMappingURL=service.d.ts.map