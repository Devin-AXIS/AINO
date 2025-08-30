import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkSkillsFields() {
  try {
    await client.connect();
    
    // 查询所有技能字段
    const result = await client.query(`
      SELECT id, key, type, schema, required 
      FROM field_defs 
      WHERE type = 'skills' OR schema->>'preset' = 'skills'
    `);
    
    if (result.rows.length === 0) {
      console.log('没有找到技能字段');
      return;
    }
    
    console.log(`找到 ${result.rows.length} 个技能字段:`);
    
    result.rows.forEach((field, index) => {
      console.log(`\n=== 技能字段 ${index + 1} ===`);
      console.log('ID:', field.id);
      console.log('Key:', field.key);
      console.log('Type:', field.type);
      console.log('Required:', field.required);
      console.log('Schema:');
      console.log(JSON.stringify(field.schema, null, 2));
      
      // 检查是否有skillsConfig
      if (field.schema.skillsConfig) {
        console.log('\n✅ 找到skillsConfig:');
        console.log(JSON.stringify(field.schema.skillsConfig, null, 2));
      } else {
        console.log('\n❌ 没有找到skillsConfig');
      }
    });
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await client.end();
  }
}

checkSkillsFields();
