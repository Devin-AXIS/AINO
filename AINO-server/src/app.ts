import { Hono } from "hono"
import { cors } from "hono/cors"
import { usersRoute } from "./modules/users/routes"
import applicationsRoute from "./modules/applications/routes"
import modulesRoute from "./modules/modules/routes"
import applicationUsersRoute from "./modules/application-users/routes"
import directoriesRoute from "./modules/directories/routes"

import fieldCategoriesRoute from "./modules/field-categories/routes"
import { records } from "./routes/records"
import { fieldDefs } from "./modules/field-defs/routes"
import { docsRoute } from "./docs/routes"

const app = new Hono()

app.use("*", cors({
  origin: (origin) => origin ?? "*",
  allowMethods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowHeaders: ["Content-Type","Authorization"],
  credentials: true,
  maxAge: 86400,
}))

app.get("/health", (c) => c.text("ok"))

// 两条前缀都挂上，防止前端写成 /users/login
app.route("/api/users", usersRoute)
app.route("/users", usersRoute)

// 应用路由
app.route("/api/applications", applicationsRoute)
app.route("/applications", applicationsRoute)

// 模块路由系统
app.route("/api/modules", modulesRoute)

// 应用用户路由（直接访问）
app.route("/api/application-users", applicationUsersRoute)

// 目录管理路由
app.route("/api/directories", directoriesRoute)



// 字段分类管理路由
app.route("/api/field-categories", fieldCategoriesRoute)

// 统一记录CRUD路由
app.route("/api/records", records)

// 字段定义管理路由
app.route("/api/field-defs", fieldDefs)

// API 文档路由
app.route("/docs", docsRoute)

// 兜底 404（结构化，不会是空对象）
app.all("/api/*", (c) => c.json({ success:false, code:"NOT_FOUND", message:"Not Found" }, 404))

export default app
