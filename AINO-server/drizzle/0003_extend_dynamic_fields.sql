-- 扩展动态字段系统 - 建立与现有系统的关联

-- 1. 扩展 directory_defs 表，添加与现有系统的关联
ALTER TABLE directory_defs 
ADD COLUMN application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
ADD COLUMN directory_id UUID REFERENCES directories(id) ON DELETE CASCADE;

-- 2. 扩展 field_defs 表，添加与字段分类的关联
ALTER TABLE field_defs 
ADD COLUMN category_id UUID REFERENCES field_categories(id) ON DELETE SET NULL;

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_directory_defs_application ON directory_defs(application_id);
CREATE INDEX IF NOT EXISTS idx_directory_defs_directory ON directory_defs(directory_id);
CREATE INDEX IF NOT EXISTS idx_field_defs_category ON field_defs(category_id);

-- 4. 添加约束确保数据完整性
ALTER TABLE directory_defs 
ADD CONSTRAINT unique_directory_mapping UNIQUE (application_id, directory_id);

-- 5. 添加注释说明字段用途
COMMENT ON COLUMN directory_defs.application_id IS '关联的应用ID';
COMMENT ON COLUMN directory_defs.directory_id IS '关联的目录ID';
COMMENT ON COLUMN field_defs.category_id IS '关联的字段分类ID';
