import { Hono } from "hono"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import { SYSTEM_MODULES } from "../../lib/system-modules"
import applicationUsersRoute from "../application-users/routes"

const app = new Hono()

// 系统模块路由处理
app.all("/system/:moduleKey/*", mockRequireAuthMiddleware, async (c) => {
  const moduleKey = c.req.param("moduleKey")
  const user = c.get("user")
  
  // 检查是否为有效的系统模块
  const validModules = ["user", "config", "audit"]
  if (!validModules.includes(moduleKey)) {
    return c.json({
      success: false,
      error: "系统模块不存在",
    }, 404)
  }
  
  // 根据模块类型路由到对应的处理器
  switch (moduleKey) {
    case "user":
      return await handleUserModule(c, user)
    case "config":
      return await handleConfigModule(c, user)
    case "audit":
      return await handleAuditModule(c, user)
    default:
      return c.json({
        success: false,
        error: "系统模块暂未实现",
      }, 501)
  }
})

// 用户模块处理器
async function handleUserModule(c: any, user: any) {
  const path = c.req.path.replace("/api/modules/system/user", "")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }
  
  // 设置应用ID到请求头，供子路由使用
  c.req.header("x-application-id", applicationId)
  
  // 路由到应用用户模块
  return applicationUsersRoute.fetch(c.req, {
    applicationId,
  })
}

// 配置模块处理器
async function handleConfigModule(c: any, user: any) {
  const path = c.req.path.replace("/api/modules/system/config", "")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }
  
  // 配置模块的API实现
  switch (c.req.method) {
    case "GET":
      if (path === "/" || path === "") {
        return c.json({
          success: true,
          data: {
            applicationId,
            config: {
              name: "应用配置",
              description: "应用基础配置管理",
              allowRegistration: true,
              requireEmailVerification: false,
            },
          },
        })
      }
      break
      
    case "PUT":
      if (path === "/" || path === "") {
        const body = await c.req.json()
        return c.json({
          success: true,
          data: {
            applicationId,
            config: body,
            updatedAt: new Date().toISOString(),
          },
        })
      }
      break
  }
  
  return c.json({
    success: false,
    error: "配置模块API暂未实现",
  }, 501)
}

// 审计模块处理器
async function handleAuditModule(c: any, user: any) {
  const path = c.req.path.replace("/api/modules/system/audit", "")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }
  
  // 审计模块的API实现
  switch (c.req.method) {
    case "GET":
      if (path === "/" || path === "") {
        return c.json({
          success: true,
          data: {
            applicationId,
            logs: [
              {
                id: "log-1",
                action: "user.login",
                userId: user.id,
                timestamp: new Date().toISOString(),
                details: {
                  ip: "127.0.0.1",
                  userAgent: "Mozilla/5.0...",
                },
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
            },
          },
        })
      }
      break
  }
  
  return c.json({
    success: false,
    error: "审计模块API暂未实现",
  }, 501)
}

// 获取系统模块列表
app.get("/system", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  
  return c.json({
    success: true,
    data: {
      modules: [
        {
          key: "user",
          name: "用户管理",
          type: "system",
          icon: "users",
          description: "应用内用户管理，支持用户注册、登录、权限管理",
        },
        {
          key: "config",
          name: "系统配置",
          type: "system",
          icon: "settings",
          description: "应用基础配置管理",
        },
        {
          key: "audit",
          name: "审计日志",
          type: "system",
          icon: "activity",
          description: "记录用户操作和系统事件",
        },
      ],
    },
  })
})

export default app
