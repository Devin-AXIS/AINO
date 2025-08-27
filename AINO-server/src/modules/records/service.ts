import { eq, and, desc, asc, sql, like, or } from 'drizzle-orm'
import { db } from '../../db'
import { dirUsers, dirJobs, directoryDefs, fieldDefs } from '../../db/schema'
import { fieldProcessorManager, FieldDef } from '../../lib/field-processors'

export interface ListQuery {
  page: number
  limit: number
  search?: string
  sort?: string
  order: 'asc' | 'desc'
  filter?: string
}

export interface ListResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class RecordsService {
  // 获取目录表映射
  private getTableByDir(dir: string) {
    switch (dir) {
      case 'users':
        return dirUsers
      case 'jobs':
        return dirJobs
      default:
        throw new Error(`不支持的目录: ${dir}`)
    }
  }

  // 获取目录定义
  private async getDirectoryDef(dir: string) {
    const def = await db.select().from(directoryDefs).where(eq(directoryDefs.slug, dir)).limit(1)
    return def[0]
  }

  // 获取字段定义
  private async getFieldDefs(dir: string) {
    const dirDef = await this.getDirectoryDef(dir)
    if (!dirDef) {
      return []
    }
    
    return await db.select().from(fieldDefs).where(eq(fieldDefs.directoryId, dirDef.id))
  }

  // 验证和转换记录数据
  private async validateAndTransformRecord(record: Record<string, any>, dir: string) {
    const fieldDefsData = await this.getFieldDefs(dir)
    
    // 转换为FieldDef类型
    const fieldDefs: FieldDef[] = fieldDefsData.map(field => ({
      id: field.id,
      key: field.key,
      kind: field.kind as any,
      type: field.type as any,
      schema: field.schema,
      relation: field.relation,
      lookup: field.lookup,
      computed: field.computed,
      validators: field.validators,
      readRoles: field.readRoles || [],
      writeRoles: field.writeRoles || [],
      required: field.required || false
    }))
    
    // 验证记录
    const validation = fieldProcessorManager.validateRecord(record, fieldDefs)
    if (!validation.valid) {
      throw new Error(`数据验证失败: ${JSON.stringify(validation.errors)}`)
    }
    
    // 转换记录
    const transformed = fieldProcessorManager.transformRecord(record, fieldDefs)
    return transformed
  }

  // 列表查询
  async listRecords(dir: string, query: ListQuery) {
    const table = this.getTableByDir(dir)
    const { page, limit, search, sort, order, filter } = query
    
    // 构建查询条件
    const conditions = [eq(table.tenantId, 'f09ebe12-f517-42a2-b41a-7092438b79c3')] // 临时租户ID
    
    // 搜索条件
    if (search) {
      conditions.push(
        sql`${table.props}::text ILIKE ${`%${search}%`}`
      )
    }
    
    // 过滤条件
    if (filter) {
      try {
        const filterObj = JSON.parse(filter)
        Object.entries(filterObj).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            conditions.push(sql`${table.props}->>${key} = ${String(value)}`)
          }
        })
      } catch (error) {
        console.warn('过滤条件解析失败:', error)
      }
    }
    
    // 排序
    const orderBy = sort ? 
      (order === 'asc' ? asc(sql`${table.props}->>${sort}`) : desc(sql`${table.props}->>${sort}`)) :
      desc(table.createdAt)
    
    // 查询数据
    const offset = (page - 1) * limit
    const data = await db.select()
      .from(table)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
    
    // 查询总数
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(table)
      .where(and(...conditions))
    
    console.log('🔍 查询参数:', { page, limit, offset, conditions: conditions.length })
    console.log('🔍 查询结果:', { dataLength: data.length, count })
    
    const result = {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    }
    
    console.log('🔍 返回结果:', JSON.stringify(result, null, 2))
    
    return result
  }

  // 获取单个记录
  async getRecord(dir: string, id: string) {
    const table = this.getTableByDir(dir)
    
    const records = await db.select()
      .from(table)
      .where(and(
        eq(table.id, id),
        eq(table.tenantId, 'f09ebe12-f517-42a2-b41a-7092438b79c3') // 临时租户ID
      ))
      .limit(1)
    
    return records[0] || null
  }

  // 创建记录
  async createRecord(dir: string, props: Record<string, any>, userId: string) {
    const table = this.getTableByDir(dir)
    
    // 验证和转换数据
    const validatedProps = await this.validateAndTransformRecord(props, dir)
    
    const [record] = await db.insert(table).values({
      tenantId: 'f09ebe12-f517-42a2-b41a-7092438b79c3', // 临时租户ID
      props: validatedProps,
      createdBy: userId,
      updatedBy: userId,
    }).returning()
    
    return record
  }

  // 更新记录
  async updateRecord(dir: string, id: string, props: Record<string, any>, version?: number, userId?: string) {
    const table = this.getTableByDir(dir)
    
    // 验证和转换数据
    const validatedProps = await this.validateAndTransformRecord(props, dir)
    
    // 构建更新条件
    const conditions = [
      eq(table.id, id),
      eq(table.tenantId, 'f09ebe12-f517-42a2-b41a-7092438b79c3') // 临时租户ID
    ]
    
    // 乐观锁检查
    if (version !== undefined) {
      conditions.push(eq(table.version, version))
    }
    
    const [record] = await db.update(table)
      .set({
        props: validatedProps,
        version: sql`${table.version} + 1`,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning()
    
    return record || null
  }

  // 删除记录
  async deleteRecord(dir: string, id: string, userId: string) {
    const table = this.getTableByDir(dir)
    
    const [record] = await db.update(table)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(
        eq(table.id, id),
        eq(table.tenantId, 'f09ebe12-f517-42a2-b41a-7092438b79c3') // 临时租户ID
      ))
      .returning()
    
    return !!record
  }
}
