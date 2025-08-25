import { getUserFromToken, extractTokenFromHeader } from '../platform/auth';
export async function mockAuthMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    if (token === 'test-token') {
        const mockUser = {
            id: 'f09ebe12-f517-42a2-b41a-7092438b79c3',
            email: 'admin@aino.com',
            name: 'Admin',
            roles: ['admin']
        };
        c.set('user', mockUser);
    }
    await next();
}
export async function mockRequireAuthMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    if (token !== 'test-token') {
        return c.json({ success: false, error: '认证失败' }, 401);
    }
    const mockUser = {
        id: 'f09ebe12-f517-42a2-b41a-7092438b79c3',
        email: 'admin@aino.com',
        name: 'Admin',
        roles: ['admin']
    };
    c.set('user', mockUser);
    await next();
}
export async function authMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    if (token) {
        const user = await getUserFromToken(token);
        if (user) {
            c.set('user', user);
        }
    }
    await next();
}
export async function requireAuthMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
        return c.json({ success: false, error: '未提供认证令牌' }, 401);
    }
    const user = await getUserFromToken(token);
    if (!user) {
        return c.json({ success: false, error: '认证令牌无效或已过期' }, 401);
    }
    c.set('user', user);
    await next();
}
export function requireRole(roles) {
    return async (c, next) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: '需要认证' }, 401);
        }
        const hasRole = user.roles.some(role => roles.includes(role));
        if (!hasRole) {
            return c.json({ success: false, error: '权限不足' }, 403);
        }
        await next();
    };
}
//# sourceMappingURL=auth.js.map