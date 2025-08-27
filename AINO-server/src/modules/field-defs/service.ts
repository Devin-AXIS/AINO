import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { fieldDefs, directoryDefs } from '../../db/schema'

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
    
    // 构建查询条件
    const conditions = []
    if (directoryId) {
      conditions.push(eq(fieldDefs.directoryId, directoryId))
    }
    
    // 查询数据
    const offset = (page - 1) * limit
    const data = await db.select()
      .from(fieldDefs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(fieldDefs.id))
      .limit(limit)
      .offset(offset)
    
    // 查询总数
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(fieldDefs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
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
    // 验证目录是否存在
    const directory = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.id, data.directoryId))
      .limit(1)
    
    if (!directory[0]) {
      throw new Error('目录不存在')
    }
    
    // 检查字段key是否已存在
    const existingField = await db.select()
      .from(fieldDefs)
      .where(and(
        eq(fieldDefs.directoryId, data.directoryId),
        eq(fieldDefs.key, data.key)
      ))
      .limit(1)
    
    if (existingField[0]) {
      throw new Error('字段key已存在')
    }
    
    const [fieldDef] = await db.insert(fieldDefs).values({
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
    }).returning()
    
    return fieldDef
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
