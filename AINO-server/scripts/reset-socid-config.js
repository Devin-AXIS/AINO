import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function resetSocidConfig() {
  try {
    await client.connect();
    
    // 移除我添加的otherVerificationConfig，恢复原始状态
    const result = await client.query(`
      UPDATE field_defs 
      SET schema = schema - 'otherVerificationConfig'
      WHERE key = 'socid'
      RETURNING *
    `);
    
    if (result.rows.length === 0) {
      console.log('没有找到socid字段');
      return;
    }
    
    console.log('✅ socid字段配置已重置');
    console.log('重置后的Schema:', JSON.stringify(result.rows[0].schema, null, 2));
    
  } catch (error) {
    console.error('重置失败:', error.message);
  } finally {
    await client.end();
  }
}

resetSocidConfig();
