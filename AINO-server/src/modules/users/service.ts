import type { TLoginReq } from "./dto"

const MOCK_EMAIL = "admin@aino.com"
const MOCK_PASS  = "admin123"

export async function loginSvc(body: TLoginReq) {
  if (body.email === MOCK_EMAIL && body.password === MOCK_PASS) {
    return {
      token: "test-token", // 先给前端一个可用 token；接库后再换 JWT
      user: {
        id: "u-1",
        email: MOCK_EMAIL,
        name: "Admin"
      }
    }
  }
  // 未通过就抛错，路由里会转成 401
  throw new Error("INVALID_CREDENTIALS")
}
