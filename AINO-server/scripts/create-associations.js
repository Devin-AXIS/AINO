const { Pool } = require('pg')

// 数据库连接配置
const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'aino',
  password: 'pass',
  database: 'aino',
  ssl: false,
})

async function createAssociations() {
  const client = await pool.connect()
  
  try {
    console.log('🔗 开始创建系统关联...')
    
    // 1. 获取现有应用和目录
    console.log('📋 获取现有应用和目录...')
    const appsResult = await client.query('SELECT id, name FROM applications LIMIT 1')
    const dirsResult = await client.query("SELECT id, name, application_id FROM directories WHERE name LIKE '%用户%' LIMIT 1")
    
    if (appsResult.rows.length === 0) {
      console.log('❌ 没有找到应用，请先创建应用')
      return
    }
    
    if (dirsResult.rows.length === 0) {
      console.log('❌ 没有找到用户相关目录，请先创建目录')
      return
    }
    
    const app = appsResult.rows[0]
    const dir = dirsResult.rows[0]
    
    console.log('📱 应用:', app.name, app.id)
    console.log('📁 目录:', dir.name, dir.id)
    
    // 2. 更新 directory_defs 表，建立关联
    console.log('🔗 更新目录定义关联...')
    await client.query(`
      UPDATE directory_defs 
      SET application_id = $1, directory_id = $2
      WHERE slug = 'users'
    `, [app.id, dir.id])
    
    // 使用正确的目录ID来获取字段分类
    const correctDirId = 'f23821f3-3614-4d05-b97e-ae39c0cccfb8'
    
    // 3. 获取字段分类
    console.log('📂 获取字段分类...')
    const categoriesResult = await client.query(`
      SELECT id, name FROM field_categories 
      WHERE directory_id = $1 
      ORDER BY "order" 
      LIMIT 3
    `, [correctDirId])
    
    console.log('📂 找到字段分类:', categoriesResult.rows.length, '个')
    
    // 4. 为字段定义分配分类
    if (categoriesResult.rows.length > 0) {
      console.log('🔗 分配字段分类...')
      
      // 获取用户目录的字段定义
      const userDirResult = await client.query(`
        SELECT id FROM directory_defs WHERE slug = 'users'
      `)
      
      if (userDirResult.rows.length > 0) {
        const userDirId = userDirResult.rows[0].id
        
        // 为字段分配分类
        const fieldCategories = [
          { fieldKey: 'name', categoryName: '基础信息' },
          { fieldKey: 'email', categoryName: '基础信息' },
          { fieldKey: 'phone', categoryName: '基础信息' },
          { fieldKey: 'city', categoryName: '基础信息' },
          { fieldKey: 'experience', categoryName: '工作信息' },
          { fieldKey: 'skills', categoryName: '技能信息' }
        ]
        
        for (const { fieldKey, categoryName } of fieldCategories) {
          const category = categoriesResult.rows.find(c => c.name.includes(categoryName) || categoryName.includes(c.name))
          if (category) {
            await client.query(`
              UPDATE field_defs 
              SET category_id = $1
              WHERE directory_id = $2 AND key = $3
            `, [category.id, userDirId, fieldKey])
            console.log(`✅ 字段 ${fieldKey} 分配到分类 ${category.name}`)
          }
        }
      }
    }
    
    // 5. 验证关联结果
    console.log('\n📊 验证关联结果:')
    
    const dirDefsResult = await client.query(`
      SELECT dd.*, a.name as app_name, d.name as dir_name
      FROM directory_defs dd
      LEFT JOIN applications a ON dd.application_id = a.id
      LEFT JOIN directories d ON dd.directory_id = d.id
      WHERE dd.slug = 'users'
    `)
    
    if (dirDefsResult.rows.length > 0) {
      const dirDef = dirDefsResult.rows[0]
      console.log('📁 目录定义关联:', {
        slug: dirDef.slug,
        title: dirDef.title,
        app: dirDef.app_name,
        directory: dirDef.dir_name
      })
    }
    
    const fieldDefsResult = await client.query(`
      SELECT fd.*, fc.name as category_name
      FROM field_defs fd
      LEFT JOIN field_categories fc ON fd.category_id = fc.id
      WHERE fd.directory_id = (SELECT id FROM directory_defs WHERE slug = 'users')
      ORDER BY fd.key
    `)
    
    console.log('📋 字段定义关联:')
    for (const field of fieldDefsResult.rows) {
      console.log(`  - ${field.key} (${field.kind}) -> ${field.category_name || '未分类'}`)
    }
    
    console.log('\n✅ 系统关联创建完成!')
    
  } catch (error) {
    console.error('❌ 创建关联失败:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createAssociations().catch(console.error)
