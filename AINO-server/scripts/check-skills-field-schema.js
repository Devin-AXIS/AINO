import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkSkillsFieldSchema() {
  try {
    await client.connect();
    
    // 查询技能字段的完整配置
    const result = await client.query(`
      SELECT id, key, schema 
      FROM field_defs 
      WHERE key = 'skills' OR schema->>'preset' = 'skills'
    `);
    
    if (result.rows.length === 0) {
      console.log('没有找到技能字段');
      return;
    }
    
    const field = result.rows[0];
    console.log('技能字段配置:');
    console.log('ID:', field.id);
    console.log('Key:', field.key);
    console.log('Type:', field.schema.type);
    console.log('Preset:', field.schema.preset);
    console.log('Schema:', JSON.stringify(field.schema, null, 2));
    
    // 检查options字段
    if (field.schema.options) {
      console.log('\n✅ 有options配置:', field.schema.options);
    } else {
      console.log('\n❌ 没有options配置');
    }
    
    // 检查skillsConfig
    if (field.schema.skillsConfig) {
      console.log('\n✅ 有skillsConfig配置:');
      console.log('allowedCategories:', field.schema.skillsConfig.allowedCategories);
      console.log('customSkills:', field.schema.skillsConfig.customSkills);
    } else {
      console.log('\n❌ 没有skillsConfig配置');
    }
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await client.end();
  }
}

checkSkillsFieldSchema();
