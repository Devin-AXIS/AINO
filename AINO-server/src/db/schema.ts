import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// 应用表 - 支持多租户和独立数据库配置
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").unique().notNull(), // 应用标识符，用于URL和数据库连接
  ownerId: uuid("owner_id").notNull(), // 应用所有者
  status: text("status").default("active").notNull(), // active, inactive, archived
  template: text("template").default("blank"), // blank, ecom, edu, content, project
  config: jsonb("config").default({}), // 应用配置，包括主题、设置等
  databaseConfig: jsonb("database_config").default({}), // 独立数据库配置
  isPublic: boolean("is_public").default(false), // 是否公开
  version: text("version").default("1.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 系统用户表 - 登录AINO平台的用户
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  roles: text("roles").array().default(["user"]).notNull(),
  avatar: text("avatar"),
  status: text("status").default("active").notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 模块表
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // system, ecom, edu, content, project, custom
  icon: text("icon"),
  config: jsonb("config").default({}),
  order: integer("order").default(0),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 目录表
export const directories = pgTable("directories", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // table, category, form
  supportsCategory: boolean("supports_category").default(false),
  config: jsonb("config").default({}),
  order: integer("order").default(0),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 字段分类表
export const fieldCategories = pgTable("field_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  directoryId: uuid("directory_id").notNull().references(() => directories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").default(0),
  enabled: boolean("enabled").default(true),
  system: boolean("system").default(false), // 是否为系统分类
  predefinedFields: jsonb("predefined_fields").default([]), // 预定义字段配置
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})



// 应用用户表 - 每个应用内部的业务用户（与系统用户无关）
export const applicationUsers = pgTable("application_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  status: text("status").default("active").notNull(), // active, inactive, pending
  role: text("role").default("user").notNull(), // admin, user, guest
  department: text("department"),
  position: text("position"),
  tags: text("tags").array().default([]),
  metadata: jsonb("metadata").default({}), // 扩展字段
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 审计日志表
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details").default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 关系定义（暂时注释掉，避免迁移问题）
// 等基础功能稳定后再添加关系定义

// 动态字段系统 - 目录定义表
export const directoryDefs = pgTable("directory_defs", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("active"),
  // 与现有系统的关联
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  directoryId: uuid("directory_id").references(() => directories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// 动态字段系统 - 字段定义表
export const fieldDefs = pgTable("field_defs", {
  id: uuid("id").primaryKey().defaultRandom(),
  directoryId: uuid("directory_id").notNull().references(() => directoryDefs.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  kind: text("kind").notNull(), // 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
  type: text("type").notNull(),
  schema: jsonb("schema"),
  relation: jsonb("relation"),
  lookup: jsonb("lookup"),
  computed: jsonb("computed"),
  validators: jsonb("validators"),
  readRoles: jsonb("read_roles").$type<string[]>().default(["admin", "member"]),
  writeRoles: jsonb("write_roles").$type<string[]>().default(["admin"]),
  required: boolean("required").default(false),
  // 与现有系统的关联
  categoryId: uuid("category_id").references(() => fieldCategories.id, { onDelete: "set null" }),
})

// 动态字段系统 - 示例动态表：用户数据
export const dirUsers = pgTable("dir_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(), // 对应 applicationId
  version: integer("version").notNull().default(1),
  props: jsonb("props").notNull().$type<Record<string, any>>().default({}),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})

// 动态字段系统 - 示例动态表：工作数据



