import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { and, eq, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { dirUsers, dirJobs } from '../db/schema'
import { getDirectoryMeta } from '../lib/meta'
import { zodFromFields, zodFromFieldsPartial } from '../lib/zod-from-fields'
import { runSerialize } from '../lib/processors'
import { buildOrderBy, projectProps, buildJsonbWhere } from '../lib/jsonb'
import { mockRequireAuthMiddleware } from '../middleware/auth'

// 定义Context类型
type AppContext = {
  Variables: {
    tenantId: string
    user: any
  }
}

const records = new Hono<AppContext>()

// 中间件
records.use('*', mockRequireAuthMiddleware)

// 查询参数验证
const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  sort: z.string().optional(),
  fields: z.string().optional(),
  filter: z.string().optional(),
})

// 获取表实例
function tableFor(dir: string) {
  switch (dir) {
    case 'users':
      return dirUsers
    case 'jobs':
      return dirJobs
    default:
      throw new Error(`Unknown directory: ${dir}`)
  }
}

// 列表查询
records.get('/:dir', zValidator('query', listQuerySchema), async (c) => {
  const dir = c.req.param('dir')
  const query = c.req.valid('query')
  
  try {
    const t = tableFor(dir)
    const tenantId = c.get('tenantId') as string || 'default-tenant'
    const page = query.page
    const pageSize = query.pageSize
    const sort = query.sort
    const fields = query.fields
    const filterRaw = query.filter

    let where: any = and(
      eq(t.tenantId, tenantId), 
      sql`${t.deletedAt} is null`
    )
    
    if (filterRaw) {
      try {
        const filters = JSON.parse(filterRaw)
        const jsonbConditions = buildJsonbWhere(t, filters)
        if (jsonbConditions.length > 0) {
          where = and(where, ...jsonbConditions)
        }
      } catch (error) {
        console.error('Failed to parse filter:', error)
      }
    }

    const orderBy = buildOrderBy(t, sort)
    const offset = (page - 1) * pageSize
    
    const rows = await db.select()
      .from(t)
      .where(where)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset)

    // 查询总数
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(t)
      .where(where)

    let data = rows.map((r: any) => ({ 
      id: r.id, 
      version: r.version, 
      ...projectProps(r.props, fields) 
    }))
    
    return c.json({ 
      success: true, 
      data,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    })
  } catch (error) {
    console.error('获取记录列表失败:', error)
    return c.json({ success: false, error: '获取记录列表失败' }, 500)
  }
})

// 详情查询
records.get('/:dir/:id', async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')
  
  try {
    const t = tableFor(dir)
    const tenantId = c.get('tenantId') as string || 'default-tenant'
    
    const [row] = await db.select()
      .from(t)
      .where(and(
        eq(t.id, id),
        eq(t.tenantId, tenantId),
        sql`${t.deletedAt} is null`
      ))
      .limit(1)
    
    if (!row) {
      return c.json({ success: false, error: '记录不存在' }, 404)
    }
    
    return c.json({ 
      success: true, 
      data: { 
        id: row.id, 
        version: row.version, 
        ...row.props 
      } 
    })
  } catch (error) {
    console.error('获取记录详情失败:', error)
    return c.json({ success: false, error: '获取记录详情失败' }, 500)
  }
})

// 创建记录
records.post('/:dir', async (c) => {
  const dir = c.req.param('dir')
  const input = await c.req.json()
  
  try {
    const t = tableFor(dir)
    const tenantId = c.get('tenantId') as string || 'default-tenant'
    
    // 获取字段定义和校验器
    const { fields } = await getDirectoryMeta(dir)
    const zod = zodFromFields(fields)
    const clean = zod.parse(input)

    const props: Record<string, any> = {}
    for (const f of fields) {
      if (clean[f.key] === undefined) continue
      props[f.key] = await runSerialize(f.kind as any, clean[f.key], f, { 
        tenantId, 
        now: new Date() 
      })
    }

    const [row] = await db.insert(t).values({ 
      tenantId, 
      props 
    }).returning()
    
    return c.json({ 
      success: true, 
      data: { 
        id: row.id, 
        version: row.version, 
        ...row.props 
      } 
    }, 201)
  } catch (error) {
    console.error('创建记录失败:', error)
    return c.json({ success: false, error: '创建记录失败' }, 500)
  }
})

// 更新记录
records.patch('/:dir/:id', async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')
  const input = await c.req.json()
  
  try {
    const t = tableFor(dir)
    const tenantId = c.get('tenantId') as string || 'default-tenant'
    
    // 获取字段定义和校验器
    const { fields } = await getDirectoryMeta(dir)
    const zod = zodFromFieldsPartial(fields)
    const clean = zod.parse(input)

    const props: Record<string, any> = {}
    for (const f of fields) {
      if (clean[f.key] === undefined) continue
      props[f.key] = await runSerialize(f.kind as any, clean[f.key], f, { 
        tenantId, 
        now: new Date() 
      })
    }

    const [row] = await db.update(t)
      .set({ 
        props: sql`${t.props} || ${JSON.stringify(props)}`,
        version: sql`${t.version} + 1`,
        updatedAt: new Date()
      })
      .where(and(
        eq(t.id, id),
        eq(t.tenantId, tenantId),
        sql`${t.deletedAt} is null`
      ))
      .returning()
    
    if (!row) {
      return c.json({ success: false, error: '记录不存在' }, 404)
    }
    
    return c.json({ 
      success: true, 
      data: { 
        id: row.id, 
        version: row.version, 
        ...row.props 
      } 
    })
  } catch (error) {
    console.error('更新记录失败:', error)
    return c.json({ success: false, error: '更新记录失败' }, 500)
  }
})

// 删除记录
records.delete('/:dir/:id', async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')
  
  try {
    const t = tableFor(dir)
    const tenantId = c.get('tenantId') as string || 'default-tenant'
    
    const [row] = await db.update(t)
      .set({ 
        deletedAt: new Date(),
        version: sql`${t.version} + 1`
      })
      .where(and(
        eq(t.id, id),
        eq(t.tenantId, tenantId),
        sql`${t.deletedAt} is null`
      ))
      .returning()
    
    if (!row) {
      return c.json({ success: false, error: '记录不存在' }, 404)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('删除记录失败:', error)
    return c.json({ success: false, error: '删除记录失败' }, 500)
  }
})

export { records }
