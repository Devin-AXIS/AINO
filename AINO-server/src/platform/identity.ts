import { z } from 'zod'

// 统一用户身份契约
export const Identity = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()).default(['user']),
  avatar: z.string().optional(),
})

export type TIdentity = z.infer<typeof Identity>

// JWT 载荷结构
export const JWTPayload = z.object({
  userId: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()).default(['user']),
  iat: z.number(), // 签发时间
  exp: z.number(), // 过期时间
})

export type TJWTPayload = z.infer<typeof JWTPayload>
