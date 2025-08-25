import { Hono } from "hono"
import { Pool } from "pg"
import { env } from "../../env"

const app = new Hono()

// 创建直接的pg连接 - 使用与后端完全相同的配置
const PG_URL = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`
const pool = new Pool({ 
  connectionString: PG_URL, 
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: false,
})

// 简单测试路由
app.get("/simple", async (c) => {
  try {
    // 直接使用pg查询
    const client = await pool.connect()
    try {
      // 先检查当前数据库
      const dbResult = await client.query('SELECT current_database() as db')
      console.log("Current database:", dbResult.rows[0]?.db)
      
      // 检查表是否存在
      const tableResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'dir_users'
      `)
      console.log("Table check result:", tableResult.rows)
      
      if (tableResult.rows.length === 0) {
        return c.json({ 
          success: false, 
          error: "Table dir_users does not exist in database: " + dbResult.rows[0]?.db,
          connectionString: PG_URL.replace(env.DB_PASSWORD, '***')
        }, 404)
      }
      
      const result = await client.query('SELECT COUNT(*) as count FROM dir_users')
      console.log("Simple test result:", result.rows)
      
      return c.json({ 
        success: true, 
        message: "Simple test successful",
        database: dbResult.rows[0]?.db,
        count: result.rows[0]?.count
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Simple test error:", error)
    return c.json({ 
      success: false, 
      error: (error as Error).message
    }, 500)
  }
})

export default app
