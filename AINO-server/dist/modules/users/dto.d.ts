import { z } from "zod";
export declare const LoginReq: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const LoginResp: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        token: z.ZodString;
        user: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type TLoginReq = z.infer<typeof LoginReq>;
//# sourceMappingURL=dto.d.ts.map