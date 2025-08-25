import { Hono } from "hono"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import { Pool } from "pg"
import { env } from "../../env"

const app = new Hono()

// 创建直接的pg连接
const pool = new Pool({
  connectionString: `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
  ssl: false,
})

// 简单测试路由
app.get("/test", mockRequireAuthMiddleware, async (c) => {
  try {
    // 直接使用pg查询
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT COUNT(*) as count FROM dir_users')
      console.log("Direct pg result:", result.rows)
      
      return c.json({ 
        success: true, 
        message: "Test successful",
        pgCount: result.rows[0]?.count
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Test error:", error)
    return c.json({ 
      success: false, 
      error: (error as Error).message,
      stack: (error as Error).stack
    }, 500)
  }
})

export default app
