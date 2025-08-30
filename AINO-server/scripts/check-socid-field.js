import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkSocidField() {
  try {
    await client.connect();
    
    // 查询socid字段的完整信息
    const result = await client.query(`
      SELECT * FROM field_defs 
      WHERE key = 'socid'
    `);
    
    if (result.rows.length === 0) {
      console.log('没有找到socid字段');
      return;
    }
    
    const field = result.rows[0];
    console.log('socid字段完整信息:');
    console.log('ID:', field.id);
    console.log('Key:', field.key);
    console.log('Type:', field.type);
    console.log('Kind:', field.kind);
    console.log('Required:', field.required);
    console.log('Schema:', JSON.stringify(field.schema, null, 2));
    console.log('Validators:', JSON.stringify(field.validators, null, 2));
    console.log('Read Roles:', field.read_roles);
    console.log('Write Roles:', field.write_roles);
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await client.end();
  }
}

checkSocidField();
