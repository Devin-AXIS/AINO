import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function testFieldUpdate() {
  try {
    await client.connect();
    
    // 查询一个字段定义
    const result = await client.query(`
      SELECT id, key, type, schema, required 
      FROM field_defs 
      WHERE directory_id = (
        SELECT id FROM directory_defs 
        WHERE directory_id = '9cba325e-fe99-40d2-a699-a38a8fcbfba8'
      )
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('没有找到字段定义');
      return;
    }
    
    const field = result.rows[0];
    console.log('找到字段:', field);
    
    // 测试更新字段的label
    const updateResult = await client.query(`
      UPDATE field_defs 
      SET schema = jsonb_set(schema, '{label}', $1)
      WHERE id = $2
      RETURNING *
    `, [JSON.stringify('测试更新_' + Date.now()), field.id]);
    
    console.log('更新结果:', updateResult.rows[0]);
    
  } catch (error) {
    console.error('测试失败:', error.message);
  } finally {
    await client.end();
  }
}

testFieldUpdate();
