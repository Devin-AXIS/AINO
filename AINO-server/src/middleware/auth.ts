import { Context, Next } from 'hono'
import { getUserFromToken, extractTokenFromHeader } from '../platform/auth'
import { TIdentity } from '../platform/identity'

// Mock 认证中间件（临时使用）
export async function mockAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (token === 'test-token') {
    // Mock 用户信息 - 使用数据库中的真实用户ID
    const mockUser: TIdentity = {
      id: 'f09ebe12-f517-42a2-b41a-7092438b79c3', // 数据库中的真实用户ID
      email: 'admin@aino.com',
      name: 'Admin',
      roles: ['admin']
    }
    c.set('user', mockUser)
  }
  
  await next()
}

// Mock 必需认证中间件（临时使用）
export async function mockRequireAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (token !== 'test-token') {
    return c.json({ success: false, error: '认证失败' }, 401)
  }
  
  // Mock 用户信息 - 使用数据库中的真实用户ID
  const mockUser: TIdentity = {
    id: 'f09ebe12-f517-42a2-b41a-7092438b79c3', // 数据库中的真实用户ID
    email: 'admin@aino.com',
    name: 'Admin',
    roles: ['admin']
  }
  c.set('user', mockUser)
  await next()
}

// 认证中间件
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (token) {
    const user = await getUserFromToken(token)
    if (user) {
      c.set('user', user)
    }
  }
  
  await next()
}

// 必需认证中间件（未认证返回 401）
export async function requireAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (!token) {
    return c.json({ success: false, error: '未提供认证令牌' }, 401)
  }
  
  const user = await getUserFromToken(token)
  if (!user) {
    return c.json({ success: false, error: '认证令牌无效或已过期' }, 401)
  }
  
  c.set('user', user)
  await next()
}

// 角色验证中间件
export function requireRole(roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as TIdentity | undefined
    
    if (!user) {
      return c.json({ success: false, error: '需要认证' }, 401)
    }
    
    const hasRole = user.roles.some(role => roles.includes(role))
    if (!hasRole) {
      return c.json({ success: false, error: '权限不足' }, 403)
    }
    
    await next()
  }
}
