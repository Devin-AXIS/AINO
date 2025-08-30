import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkSocidCurrent() {
  try {
    await client.connect();
    
    // 查询socid字段的当前配置
    const result = await client.query(`
      SELECT id, key, type, schema, required 
      FROM field_defs 
      WHERE key = 'socid'
    `);
    
    if (result.rows.length === 0) {
      console.log('没有找到socid字段');
      return;
    }
    
    const field = result.rows[0];
    console.log('socid字段当前配置:');
    console.log('ID:', field.id);
    console.log('Key:', field.key);
    console.log('Type:', field.type);
    console.log('Required:', field.required);
    console.log('Schema:');
    console.log(JSON.stringify(field.schema, null, 2));
    
    // 检查是否有otherVerificationConfig
    if (field.schema.otherVerificationConfig) {
      console.log('\n✅ 找到otherVerificationConfig:');
      console.log(JSON.stringify(field.schema.otherVerificationConfig, null, 2));
    } else {
      console.log('\n❌ 没有找到otherVerificationConfig');
    }
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await client.end();
  }
}

checkSocidCurrent();
