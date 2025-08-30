import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkOtherVerificationFields() {
  try {
    await client.connect();
    
    // 查询所有字段定义
    const result = await client.query(`
      SELECT id, key, type, schema, required 
      FROM field_defs 
      WHERE schema->>'preset' = 'other_verification'
         OR type = 'other_verification'
         OR key LIKE '%other%'
         OR key LIKE '%认证%'
    `);
    
    console.log('找到的其他认证相关字段:');
    result.rows.forEach(field => {
      console.log('字段ID:', field.id);
      console.log('字段Key:', field.key);
      console.log('字段Type:', field.type);
      console.log('字段Schema:', JSON.stringify(field.schema, null, 2));
      console.log('是否必填:', field.required);
      console.log('---');
    });
    
    if (result.rows.length === 0) {
      console.log('没有找到其他认证相关字段');
    }
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await client.end();
  }
}

checkOtherVerificationFields();
