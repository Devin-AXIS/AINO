import { z } from 'zod';
export const Identity = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()).default(['user']),
    avatar: z.string().optional(),
});
export const JWTPayload = z.object({
    userId: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()).default(['user']),
    iat: z.number(),
    exp: z.number(),
});
//# sourceMappingURL=identity.js.map