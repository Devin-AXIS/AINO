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

// 字段表
export const fields = pgTable("fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  directoryId: uuid("directory_id").notNull().references(() => directories.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => fieldCategories.id, { onDelete: "set null" }), // 字段分类ID
  key: text("key").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull(),
  required: boolean("required").default(false),
  unique: boolean("unique").default(false),
  locked: boolean("locked").default(false),
  enabled: boolean("enabled").default(true),
  desc: text("desc"),
  placeholder: text("placeholder"),
  
  // 数值配置
  min: integer("min"),
  max: integer("max"),
  step: integer("step"),
  unit: text("unit"),
  
  // 选择配置
  options: text("options").array(),
  default: jsonb("default"),
  
  // 显示配置
  showInList: boolean("show_in_list").default(true),
  showInForm: boolean("show_in_form").default(true),
  showInDetail: boolean("show_in_detail").default(true),
  
  // 布尔配置
  trueLabel: text("true_label"),
  falseLabel: text("false_label"),
  
  // 媒体配置
  accept: text("accept"),
  maxSizeMB: integer("max_size_mb"),
  
  // 关联配置
  relation: jsonb("relation"),
  
  // 级联配置
  cascaderOptions: jsonb("cascader_options"),
  
  // 日期配置
  dateMode: text("date_mode"),
  
  // 预设配置
  preset: text("preset"),
  
  // 特殊配置
  skillsConfig: jsonb("skills_config"),
  progressConfig: jsonb("progress_config"),
  customExperienceConfig: jsonb("custom_experience_config"),
  identityVerificationConfig: jsonb("identity_verification_config"),
  certificateConfig: jsonb("certificate_config"),
  otherVerificationConfig: jsonb("other_verification_config"),
  imageConfig: jsonb("image_config"),
  videoConfig: jsonb("video_config"),
  booleanConfig: jsonb("boolean_config"),
  multiselectConfig: jsonb("multiselect_config"),
  
  // 保留原有config字段用于向后兼容
  config: jsonb("config").default({}),
  order: integer("order").default(0),
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
