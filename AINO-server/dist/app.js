import { Hono } from "hono";
import { cors } from "hono/cors";
import { usersRoute } from "./modules/users/routes";
import applicationsRoute from "./modules/applications/routes";
import modulesRoute from "./modules/modules/routes";
import applicationUsersRoute from "./modules/application-users/routes";
import directoriesRoute from "./modules/directories/routes";
import fieldCategoriesRoute from "./modules/field-categories/routes";
import { records } from "./modules/records/routes";
import { fieldDefs } from "./modules/field-defs/routes";
import { docsRoute } from "./docs/routes";
const app = new Hono();
app.use("*", cors({
    origin: (origin) => origin ?? "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
}));
app.get("/health", (c) => c.text("ok"));
app.route("/api/users", usersRoute);
app.route("/users", usersRoute);
app.route("/api/applications", applicationsRoute);
app.route("/applications", applicationsRoute);
app.route("/api/modules", modulesRoute);
app.route("/api/application-users", applicationUsersRoute);
app.route("/api/directories", directoriesRoute);
app.route("/api/field-categories", fieldCategoriesRoute);
app.route("/api/records", records);
app.route("/api/field-defs", fieldDefs);
app.route("/docs", docsRoute);
app.all("/api/*", (c) => c.json({ success: false, code: "NOT_FOUND", message: "Not Found" }, 404));
export default app;
//# sourceMappingURL=app.js.map