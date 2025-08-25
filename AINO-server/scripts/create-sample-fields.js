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

async function createSampleData() {
  const client = await pool.connect()
  
  try {
    // 1. 创建目录定义
    console.log('Creating directory definitions...')
    const dirResult = await client.query(`
      INSERT INTO directory_defs (slug, title, status) 
      VALUES 
        ('users', '用户管理', 'active'),
        ('jobs', '工作管理', 'active')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug
    `)
    
    // 使用已知的目录ID
    const dirMap = {
      users: 'e73afbba-03d3-41ab-b618-d919b550693b',
      jobs: 'dcf8198a-451d-4513-a506-62d8362d5fb8'
    }
    
    console.log('Directory IDs:', dirMap)
    
    // 2. 为用户目录创建字段定义
    console.log('Creating field definitions for users...')
    const userFields = [
      {
        directory_id: dirMap.users,
        key: 'name',
        kind: 'primitive',
        type: 'text',
        required: true
      },
      {
        directory_id: dirMap.users,
        key: 'email',
        kind: 'primitive',
        type: 'email',
        required: true
      },
      {
        directory_id: dirMap.users,
        key: 'phone',
        kind: 'primitive',
        type: 'phone',
        required: false
      },
      {
        directory_id: dirMap.users,
        key: 'city',
        kind: 'lookup',
        type: 'text',
        lookup: { source: 'china_cities' },
        required: false
      },
      {
        directory_id: dirMap.users,
        key: 'experience',
        kind: 'composite',
        type: 'json',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company: { type: 'string' },
              position: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        required: false
      },
      {
        directory_id: dirMap.users,
        key: 'skills',
        kind: 'relation',
        type: 'json',
        relation: { targetDir: 'skills', cardinality: 'NN' },
        required: false
      }
    ]
    
    for (const field of userFields) {
      await client.query(`
        INSERT INTO field_defs (directory_id, key, kind, type, schema, relation, lookup, required)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        field.directory_id,
        field.key,
        field.kind,
        field.type,
        field.schema ? JSON.stringify(field.schema) : null,
        field.relation ? JSON.stringify(field.relation) : null,
        field.lookup ? JSON.stringify(field.lookup) : null,
        field.required
      ])
    }
    
    // 3. 为工作目录创建字段定义
    console.log('Creating field definitions for jobs...')
    const jobFields = [
      {
        directory_id: dirMap.jobs,
        key: 'title',
        kind: 'primitive',
        type: 'text',
        required: true
      },
      {
        directory_id: dirMap.jobs,
        key: 'company',
        kind: 'primitive',
        type: 'text',
        required: true
      },
      {
        directory_id: dirMap.jobs,
        key: 'location',
        kind: 'lookup',
        type: 'text',
        lookup: { source: 'china_cities' },
        required: false
      },
      {
        directory_id: dirMap.jobs,
        key: 'salary',
        kind: 'primitive',
        type: 'number',
        required: false
      },
      {
        directory_id: dirMap.jobs,
        key: 'requirements',
        kind: 'composite',
        type: 'json',
        schema: {
          type: 'object',
          properties: {
            experience: { type: 'string' },
            education: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } }
          }
        },
        required: false
      }
    ]
    
    for (const field of jobFields) {
      await client.query(`
        INSERT INTO field_defs (directory_id, key, kind, type, schema, relation, lookup, required)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        field.directory_id,
        field.key,
        field.kind,
        field.type,
        field.schema ? JSON.stringify(field.schema) : null,
        field.relation ? JSON.stringify(field.relation) : null,
        field.lookup ? JSON.stringify(field.lookup) : null,
        field.required
      ])
    }
    
    console.log('✅ Sample data created successfully!')
    
    // 4. 验证数据
    console.log('\n📊 Verification:')
    
    const dirs = await client.query('SELECT * FROM directory_defs')
    console.log('Directories:', dirs.rows)
    
    const fields = await client.query('SELECT * FROM field_defs ORDER BY directory_id, key')
    console.log('Fields:', fields.rows)
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createSampleData().catch(console.error)
