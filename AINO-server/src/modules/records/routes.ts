import { Hono } from "hono"
import { db } from "../../db"
import { getDirectoryMeta } from "../../lib/meta"
import { jsonEq, buildOrderBy, projectProps } from "../../lib/jsonb"
import { runSerialize } from "../../lib/processors"
import { zodFromFields } from "../../lib/zod-from-fields"
import { and, eq, sql } from "drizzle-orm"
import { dirUsers, dirJobs } from "../../db/schema"
import { mockRequireAuthMiddleware } from "../../middleware/auth"

const app = new Hono()

// 目录到表的映射
const tableOf: Record<string, any> = {
  users: dirUsers,
  jobs: dirJobs,
}

function tableFor(dir: string) {
  const t = tableOf[dir]
  if (!t) throw new Error(`unknown directory table for ${dir}`)
  return t
}

// 列表
app.get("/:dir", mockRequireAuthMiddleware, async (c) => {
  try {
    const dir = c.req.param("dir")
    const t = tableFor(dir)
    const tenantId = "f09ebe12-f517-42a2-b41a-7092438b79c3" // 使用有效的UUID
    const page = Number(c.req.query("page") ?? "1")
    const pageSize = Math.min(Number(c.req.query("pageSize") ?? "20"), 50)
    const sort = c.req.query("sort") || undefined
    const fields = c.req.query("fields") || undefined
    const filterRaw = c.req.query("filter")

    let where: any = and(eq(t.tenantId, tenantId), sql`${t.deletedAt} is null`)
    if (filterRaw) {
      try {
        const filters = JSON.parse(filterRaw)
        for (const [k, v] of Object.entries(filters)) {
          where = and(where, jsonEq(t.props, k, v))
        }
      } catch {}
    }

    const orderBy = buildOrderBy(t.props, sort)
    const rows = await db
      .select()
      .from(t)
      .where(where)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    // 字段投影
    let data = rows.map((r: any) => ({
      id: r.id,
      version: r.version,
      ...projectProps(r.props, fields),
    }))

    return c.json({ success: true, data })
  } catch (error) {
    console.error("Records list error:", error)
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// 详情
app.get("/:dir/:id", mockRequireAuthMiddleware, async (c) => {
  try {
    const dir = c.req.param("dir")
    const id = c.req.param("id")
    const t = tableFor(dir)
    const tenantId = "f09ebe12-f517-42a2-b41a-7092438b79c3"

    const row = await db
      .select()
      .from(t)
      .where(and(eq(t.id, id), eq(t.tenantId, tenantId), sql`${t.deletedAt} is null`))
      .limit(1)

    if (!row.length) return c.json({ success: false, error: "not_found" }, 404)
    
    return c.json({
      success: true,
      data: { id: row[0].id, version: row[0].version, ...row[0].props },
    })
  } catch (error) {
    console.error("Records detail error:", error)
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// 创建
app.post("/:dir", mockRequireAuthMiddleware, async (c) => {
  try {
    const dir = c.req.param("dir")
    const t = tableFor(dir)
    const tenantId = "f09ebe12-f517-42a2-b41a-7092438b79c3"
    const input = await c.req.json()

    // 获取字段定义并验证
    let fields: any[] = []
    try {
      const meta = await getDirectoryMeta(dir)
      fields = meta.fields
      
      // 使用Zod验证输入
      const zod = zodFromFields(fields)
      const clean = zod.parse(input)
      
      // 使用字段处理器处理数据
      const props: Record<string, any> = {}
      console.log('Processing fields:', fields.length)
      for (const f of fields) {
        if (clean[f.key] === undefined) continue
        console.log('Processing field:', f.key, 'kind:', f.kind, 'value:', clean[f.key])
        props[f.key] = await runSerialize(f.kind as any, clean[f.key], f, { tenantId, now: new Date() })
        console.log('Processed result:', props[f.key])
      }
      
      const result = await db.insert(t).values({ tenantId, props }).returning()
      const row = (result as any[])[0]
      
      return c.json({
        success: true,
        data: { id: row.id, version: row.version, ...row.props },
      })
    } catch (metaError) {
      // 如果获取字段定义失败，使用简化模式
      console.warn("Failed to get field definitions, using simple mode:", metaError)
      const result = await db.insert(t).values({ tenantId, props: input }).returning()
      const row = (result as any[])[0]
      
      return c.json({
        success: true,
        data: { id: row.id, version: row.version, ...row.props },
      })
    }
  } catch (error) {
    console.error("Records create error:", error)
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// 更新
app.patch("/:dir/:id", mockRequireAuthMiddleware, async (c) => {
  try {
    const dir = c.req.param("dir")
    const id = c.req.param("id")
    const clientVersion = Number(c.req.query("version") ?? "0")
    const t = tableFor(dir)
    const tenantId = "f09ebe12-f517-42a2-b41a-7092438b79c3"
    const input = await c.req.json()

    const rows = await db
      .update(t)
      .set({
        props: sql`(${t.props}) || ${input}::jsonb`,
        version: sql`${t.version} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(t.id, id), eq(t.tenantId, tenantId), eq(t.version, clientVersion)))
      .returning()

    if (!rows.length) return c.json({ success: false, error: "version_conflict" }, 409)
    
    const row = rows[0]
    return c.json({
      success: true,
      data: { id: row.id, version: row.version, ...row.props },
    })
  } catch (error) {
    console.error("Records update error:", error)
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

// 删除
app.delete("/:dir/:id", mockRequireAuthMiddleware, async (c) => {
  try {
    const dir = c.req.param("dir")
    const id = c.req.param("id")
    const t = tableFor(dir)
    const tenantId = "f09ebe12-f517-42a2-b41a-7092438b79c3"

    await db
      .update(t)
      .set({ deletedAt: new Date() })
      .where(and(eq(t.id, id), eq(t.tenantId, tenantId)))

    return c.json({ success: true })
  } catch (error) {
    console.error("Records delete error:", error)
    return c.json({ success: false, error: (error as Error).message }, 500)
  }
})

export default app
