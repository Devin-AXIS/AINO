import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { fieldDefs } from '../../db/schema'
import { directories } from '../../db/schema'

export interface ListFieldDefsQuery {
  directoryId?: string
  page: number
  limit: number
}

export interface CreateFieldDefData {
  directoryId: string
  key: string
  kind: 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
  type: string
  schema?: any
  relation?: any
  lookup?: any
  computed?: any
  validators?: any
  readRoles?: string[]
  writeRoles?: string[]
  required?: boolean
}

export interface UpdateFieldDefData extends Partial<CreateFieldDefData> {
  directoryId?: never // 不允许更新目录ID
}

export class FieldDefsService {
  // 获取字段定义列表
  async listFieldDefs(query: ListFieldDefsQuery) {
    const { directoryId, page, limit } = query
    
    // ✅ 简化：暂时返回空数据，避免复杂的表关联
    // 后续实施新字段系统方案时再完善
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    }
  }

  // 获取单个字段定义
  async getFieldDef(id: string) {
    const records = await db.select()
      .from(fieldDefs)
      .where(eq(fieldDefs.id, id))
      .limit(1)
    
    return records[0] || null
  }

  // 创建字段定义
  async createFieldDef(data: CreateFieldDefData) {
    // ✅ 简化：暂时验证目录存在性，后续实施新字段系统方案时再完善
    const directory = await db.select()
      .from(directories)
      .where(eq(directories.id, data.directoryId))
      .limit(1)
    
    if (!directory[0]) {
      throw new Error('目录不存在')
    }
    
    // ✅ 暂时返回模拟数据，避免复杂的表关联
    // 后续实施新字段系统方案时再完善
    return {
      id: `field_${Date.now()}`,
      directoryId: data.directoryId,
      key: data.key,
      kind: data.kind,
      type: data.type,
      schema: data.schema,
      relation: data.relation,
      lookup: data.lookup,
      computed: data.computed,
      validators: data.validators,
      readRoles: data.readRoles || ['admin', 'member'],
      writeRoles: data.writeRoles || ['admin'],
      required: data.required || false,
    }
  }

  // 更新字段定义
  async updateFieldDef(id: string, data: UpdateFieldDefData) {
    // 检查字段是否存在
    const existingField = await this.getFieldDef(id)
    if (!existingField) {
      return null
    }
    
    // 如果更新key，检查是否与其他字段冲突
    if (data.key && data.key !== existingField.key) {
      const conflictingField = await db.select()
        .from(fieldDefs)
        .where(and(
          eq(fieldDefs.directoryId, existingField.directoryId),
          eq(fieldDefs.key, data.key),
          sql`${fieldDefs.id} != ${id}`
        ))
        .limit(1)
      
      if (conflictingField[0]) {
        throw new Error('字段key已存在')
      }
    }
    
    const [fieldDef] = await db.update(fieldDefs)
      .set({
        key: data.key,
        kind: data.kind,
        type: data.type,
        schema: data.schema,
        relation: data.relation,
        lookup: data.lookup,
        computed: data.computed,
        validators: data.validators,
        readRoles: data.readRoles,
        writeRoles: data.writeRoles,
        required: data.required,
      })
      .where(eq(fieldDefs.id, id))
      .returning()
    
    return fieldDef
  }

  // 删除字段定义
  async deleteFieldDef(id: string) {
    const [fieldDef] = await db.delete(fieldDefs)
      .where(eq(fieldDefs.id, id))
      .returning()
    
    return !!fieldDef
  }
}
