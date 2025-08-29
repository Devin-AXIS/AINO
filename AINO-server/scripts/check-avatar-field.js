import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkAvatarField() {
  try {
    await client.connect();
    const result = await client.query(`
      SELECT key, type, schema, required 
      FROM field_defs 
      WHERE key = 'avatar' 
      AND directory_id = (
        SELECT id FROM directory_defs 
        WHERE directory_id = '9cba325e-fe99-40d2-a699-a38a8fcbfba8'
      )
    `);
    console.log('Avatar字段定义:', result.rows);
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await client.end();
  }
}

checkAvatarField();
