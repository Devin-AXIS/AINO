import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'aino',
  password: 'pass',
  database: 'aino'
});

async function fixSocidFieldConfig() {
  try {
    await client.connect();
    
    // 为socid字段添加默认的otherVerificationConfig配置
    const defaultConfig = {
      textFields: [
        { id: 'certificate_name', name: '证书名称', required: false },
        { id: 'certificate_number', name: '证书编号', required: false },
        { id: 'issuing_authority', name: '颁发机构', required: false },
        { id: 'issue_date', name: '颁发日期', required: false },
        { id: 'expiry_date', name: '有效期', required: false }
      ],
      imageFields: [
        { id: 'certificate_image', name: '证书图片', required: false, multiple: false },
        { id: 'additional_documents', name: '补充材料', required: false, multiple: true }
      ]
    };
    
    const result = await client.query(`
      UPDATE field_defs 
      SET schema = jsonb_set(schema, '{otherVerificationConfig}', $1)
      WHERE key = 'socid'
      RETURNING *
    `, [JSON.stringify(defaultConfig)]);
    
    if (result.rows.length === 0) {
      console.log('没有找到socid字段');
      return;
    }
    
    console.log('✅ socid字段配置更新成功');
    console.log('更新后的Schema:', JSON.stringify(result.rows[0].schema, null, 2));
    
  } catch (error) {
    console.error('更新失败:', error.message);
  } finally {
    await client.end();
  }
}

fixSocidFieldConfig();
