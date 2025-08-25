import { Hono } from "hono"
import { z } from "zod"

// 兼容：邮箱/用户名字段名 & 任意内容类型
const LoginBody = z.object({
  email: z.string().email().or(z.string().min(1)).optional(), // 有些前端传非 email
  username: z.string().optional(),
  account: z.string().optional(),
  password: z.string().min(1),
})

// 支持多个测试账号
const users = [
  { id: "u-1", email: "admin@aino.com", name: "Admin", pass: "admin123" },
  { id: "u-2", email: "admin@example.com", name: "Admin", pass: "admin123" },
  { id: "u-3", email: "test@aino.com", name: "Test User", pass: "test123" }
]

export const usersRoute = new Hono()

usersRoute.options("/login", (c) => c.text("ok"))

// 统一解析 JSON / x-www-form-urlencoded / multipart
async function readLoginBody(c: any) {
  const ct = c.req.header("content-type") || ""
  console.log("📋 Content-Type:", ct)
  
  try {
    if (ct.includes("application/json")) {
      const jsonData = await c.req.json()
      console.log("📋 JSON 数据:", jsonData)
      return jsonData
    }
    
    // 对于表单数据，先尝试 parseBody
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      try {
        const formData = await c.req.parseBody()
        console.log("📋 表单数据:", formData)
        return formData
      } catch (formError) {
        console.log("📋 表单解析失败:", formError)
        // 如果 parseBody 失败，尝试作为 JSON 解析
        try {
          const jsonData = await c.req.json()
          console.log("📋 回退到 JSON:", jsonData)
          return jsonData
        } catch (jsonError) {
          console.log("📋 JSON 解析也失败:", jsonError)
          return {}
        }
      }
    }
    
    // 默认尝试 JSON
    const jsonData = await c.req.json()
    console.log("📋 默认 JSON:", jsonData)
    return jsonData
  } catch (error) {
    console.log("📋 所有解析方法都失败:", error)
    return {}
  }
}

usersRoute.post("/login", async (c) => {
  const raw = await readLoginBody(c)
  console.log("📋 最终原始请求体:", raw)

  // 归一化字段：email 优先，其次 username/account
  const normalized = {
    email: raw.email ?? raw.username ?? raw.account ?? "",
    password: raw.password ?? "",
  }
  console.log("📋 归一化后:", normalized)

  const parsed = LoginBody.safeParse({ ...normalized })
  if (!parsed.success) {
    console.log("📋 验证失败:", parsed.error.flatten())
    // 始终返回结构化 JSON，避免 {}
    return c.json({ success: false, code: "BAD_REQUEST", message: "参数错误", detail: parsed.error.flatten() }, 400)
  }

  const { email, password } = parsed.data
  const user = users.find(u => (u.email === email) && (u.pass === password))

  if (!user) {
    console.log("📋 用户验证失败:", { email, password })
    // 某些前端把非 200 直接当异常，这里返回 200 但 success=false，便于 UI 提示
    return c.json({ success: false, code: "INVALID_CREDENTIALS", message: "登录失败" }, 200)
  }

  console.log("📋 用户验证成功:", user.email)
  const token = "test-token" // 先用固定串；接库后换成 JWT

  // 兼容多种前端期望：同时返回 success/data/token/user/code/message
  return c.json({
    success: true,
    code: 0,
    message: "OK",
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    },
    // 兼容一些直接取顶层字段的实现
    token,
    user: { id: user.id, email: user.email, name: user.name },
  }, 200)
})
