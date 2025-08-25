import { Hono } from "hono"
import { getDirectoryMeta } from "../../lib/meta"

const app = new Hono()

// 测试meta函数
app.get("/meta/:dir", async (c) => {
  try {
    const dir = c.req.param("dir")
    console.log('Testing meta for directory:', dir)
    
    const meta = await getDirectoryMeta(dir)
    console.log('Meta result:', meta)
    
    return c.json({ 
      success: true, 
      meta: {
        dir: meta.dir,
        fields: meta.fields.map(f => ({
          key: f.key,
          kind: f.kind,
          type: f.type,
          required: f.required
        }))
      }
    })
  } catch (error) {
    console.error("Meta test error:", error)
    return c.json({ 
      success: false, 
      error: (error as Error).message
    }, 500)
  }
})

export default app
