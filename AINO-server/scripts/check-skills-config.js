import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkSkillsConfig() {
  try {
    await client.connect();
    
    // 查询技能字段的配置
    const result = await client.query(`
      SELECT id, key, type, schema, required 
      FROM field_defs 
      WHERE key = 'skills' OR schema->>'preset' = 'skills'
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
      
      // 检查skillsConfig
      if (field.schema.skillsConfig) {
        console.log('\n✅ 找到skillsConfig:');
        console.log('allowedCategories:', field.schema.skillsConfig.allowedCategories);
        console.log('customCategories:', field.schema.skillsConfig.customCategories);
        console.log('customSkills:', field.schema.skillsConfig.customSkills);
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

checkSkillsConfig();
