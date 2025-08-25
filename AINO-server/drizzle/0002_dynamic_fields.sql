-- 动态字段系统迁移
-- 创建目录定义表
CREATE TABLE IF NOT EXISTS "directory_defs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"version" integer NOT NULL DEFAULT 1,
	"status" text NOT NULL DEFAULT 'active',
	"created_at" timestamptz DEFAULT now(),
	"updated_at" timestamptz DEFAULT now()
);

-- 创建字段定义表
CREATE TABLE IF NOT EXISTS "field_defs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"directory_id" uuid NOT NULL REFERENCES "directory_defs"("id") ON DELETE CASCADE,
	"key" text NOT NULL,
	"kind" text NOT NULL,
	"type" text NOT NULL,
	"schema" jsonb,
	"relation" jsonb,
	"lookup" jsonb,
	"computed" jsonb,
	"validators" jsonb,
	"read_roles" jsonb DEFAULT '["admin","member"]',
	"write_roles" jsonb DEFAULT '["admin"]',
	"required" boolean DEFAULT false
);

-- 创建动态用户表
CREATE TABLE IF NOT EXISTS "dir_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"version" integer NOT NULL DEFAULT 1,
	"props" jsonb NOT NULL DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamptz DEFAULT now(),
	"updated_at" timestamptz DEFAULT now(),
	"deleted_at" timestamptz
);

-- 创建动态工作表
CREATE TABLE IF NOT EXISTS "dir_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"version" integer NOT NULL DEFAULT 1,
	"props" jsonb NOT NULL DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamptz DEFAULT now(),
	"updated_at" timestamptz DEFAULT now(),
	"deleted_at" timestamptz
);

-- 创建字段索引表
CREATE TABLE IF NOT EXISTS "field_indexes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dir_slug" text NOT NULL,
	"record_id" uuid NOT NULL,
	"field_key" text NOT NULL,
	"search_value" text,
	"numeric_value" integer,
	"created_at" timestamptz DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "idx_dir_users_tenant" ON "dir_users"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_dir_users_props_gin" ON "dir_users" USING gin("props" jsonb_path_ops);
CREATE INDEX IF NOT EXISTS "idx_dir_jobs_tenant" ON "dir_jobs"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_dir_jobs_props_gin" ON "dir_jobs" USING gin("props" jsonb_path_ops);
CREATE INDEX IF NOT EXISTS "idx_field_defs_directory" ON "field_defs"("directory_id");
CREATE INDEX IF NOT EXISTS "idx_field_indexes_record" ON "field_indexes"("record_id");
