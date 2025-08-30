import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function checkCurrentSkillsConfig() {
  try {
    await client.connect();
    
    // 查询技能字段的配置
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
    const skillsConfig = field.schema.skillsConfig;
    
    console.log('当前技能字段配置:');
    console.log('allowedCategories:', skillsConfig.allowedCategories);
    console.log('customCategories:', skillsConfig.customCategories);
    console.log('customSkills:', skillsConfig.customSkills);
    
    // 检查是否有自定义分类
    if (skillsConfig.customCategories && skillsConfig.customCategories.length > 0) {
      console.log('\n✅ 有自定义分类，应该使用自定义分类');
      console.log('分类名称:', skillsConfig.customCategories.map(c => c.name));
    } else {
      console.log('\n❌ 没有自定义分类，应该使用预定义分类');
    }
    
    // 检查allowedCategories是否为空
    if (skillsConfig.allowedCategories && skillsConfig.allowedCategories.length > 0) {
      console.log('\n✅ allowedCategories不为空，应该过滤分类');
    } else {
      console.log('\n❌ allowedCategories为空，应该显示所有分类');
    }
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await client.end();
  }
}

checkCurrentSkillsConfig();
