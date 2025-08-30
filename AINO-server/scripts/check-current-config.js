import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkCurrentConfig() {
  try {
    await client.connect();
    
    // 查询所有其他认证相关字段
    const result = await client.query(`
      SELECT id, key, type, schema, required 
      FROM field_defs 
      WHERE schema->>'preset' = 'other_verification'
         OR type = 'other_verification'
    `);
    
    console.log('当前其他认证字段配置:');
    result.rows.forEach((field, index) => {
      console.log(`\n=== 字段 ${index + 1} ===`);
      console.log('ID:', field.id);
      console.log('Key:', field.key);
      console.log('Type:', field.type);
      console.log('Required:', field.required);
      console.log('完整Schema:');
      console.log(JSON.stringify(field.schema, null, 2));
    });
    
    if (result.rows.length === 0) {
      console.log('没有找到其他认证字段');
    }
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await client.end();
  }
}

checkCurrentConfig();
