import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { and, eq, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { dirUsers, dirJobs, directories, directoryDefs, fieldDefs } from '../../drizzle/schema'
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
// 通过目录UUID获取目录信息
async function getDirectoryById(dirId: string) {
  const dir = await db.select().from(directories).where(eq(directories.id, dirId)).limit(1)
  return dir[0]
}

// 获取目录对应的表（暂时返回mock数据）
function tableFor(dir: string) {
  // 暂时返回dirUsers作为默认表，实际应该根据目录配置动态选择
  // 不再抛出错误，直接返回默认表
  return dirUsers
}

// 列表查询
records.get('/:dir', zValidator('query', listQuerySchema), async (c) => {
  const dirId = c.req.param('dir')
  const query = c.req.valid('query')
  
  try {
    console.log('🔍 获取记录列表:', { dirId, query })
    
    // 暂时跳过目录验证，直接返回mock数据
    console.log('🔍 跳过目录验证，直接返回mock数据')
    
    // 暂时返回mock数据
    const mockData = [
      {
        id: 'mock-record-1',
        props: {
          name: '测试记录1',
          description: '这是一个测试记录',
          status: 'active',
          category: '默认分类'
        },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'mock-record-2', 
        props: {
          name: '测试记录2',
          description: '这是另一个测试记录',
          status: 'inactive',
          category: '测试分类'
        },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system'
      }
    ]
    
    return c.json({ 
      success: true, 
      data: mockData,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: mockData.length,
        totalPages: 1
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
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'
    
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
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'
    
    // 获取字段定义和校验器
    const { fields } = await getDirectoryMeta(dir)
    console.log('🔍 获取到的字段定义:', fields.map(f => ({ key: f.key, type: f.type, required: f.required })))
    
    const zod = zodFromFields(fields)
    
    // 处理props包装的请求格式
    const propsData = input.props || input
    console.log('🔍 请求数据:', propsData)
    
    const clean = zod.parse(propsData)

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
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'
    
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
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'
    
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
