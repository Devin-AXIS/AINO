import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function updateSkillsConfig() {
  try {
    await client.connect();
    
    // 查询技能字段
    const result = await client.query(`
      SELECT id, key, schema 
      FROM field_defs 
      WHERE key = 'skills' OR schema->>'preset' = 'skills'
    `);
    
    if (result.rows.length === 0) {
      console.log('没有找到技能字段');
      return;
    }
    
    for (const field of result.rows) {
      console.log(`更新字段: ${field.key}`);
      
      const currentSchema = field.schema;
      const currentSkillsConfig = currentSchema.skillsConfig || {};
      
      // 如果 allowedCategories 为空，但 customCategories 有数据，则同步 allowedCategories
      if (currentSkillsConfig.allowedCategories && currentSkillsConfig.allowedCategories.length === 0) {
        if (currentSkillsConfig.customCategories && currentSkillsConfig.customCategories.length > 0) {
          const categoryNames = currentSkillsConfig.customCategories.map(cat => cat.name);
          currentSkillsConfig.allowedCategories = categoryNames;
          
          console.log('同步 allowedCategories:', categoryNames);
          
          // 更新数据库
          await client.query(`
            UPDATE field_defs 
            SET schema = $1 
            WHERE id = $2
          `, [currentSchema, field.id]);
          
          console.log('✅ 字段配置已更新');
        }
      } else {
        console.log('字段配置无需更新');
      }
    }
    
  } catch (error) {
    console.error('更新失败:', error.message);
  } finally {
    await client.end();
  }
}

updateSkillsConfig();
