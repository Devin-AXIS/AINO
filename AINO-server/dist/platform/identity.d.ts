import { z } from 'zod';
export declare const Identity: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    roles: z.ZodDefault<z.ZodArray<z.ZodString>>;
    avatar: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TIdentity = z.infer<typeof Identity>;
export declare const JWTPayload: z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodString;
    roles: z.ZodDefault<z.ZodArray<z.ZodString>>;
    iat: z.ZodNumber;
    exp: z.ZodNumber;
}, z.core.$strip>;
export type TJWTPayload = z.infer<typeof JWTPayload>;
//# sourceMappingURL=identity.d.ts.map