import fetch from 'node-fetch';

async function testFieldUpdateAPI() {
  try {
    // 首先获取一个字段定义
    const listResponse = await fetch('http://localhost:3001/api/field-defs?directoryId=0bb4b6ca-1ed5-4f9b-bcc6-77fae727f85e');
    const listData = await listResponse.json();
    
    if (!listData.success || !listData.data || listData.data.length === 0) {
      console.log('没有找到字段定义');
      return;
    }
    
    const field = listData.data[0];
    console.log('找到字段:', field);
    
    // 测试更新字段
    const updateData = {
      key: field.key,
      type: field.type,
      schema: {
        ...field.schema,
        label: '测试更新标签_' + Date.now()
      },
      validators: field.validators || {},
      required: field.required || false,
    };
    
    console.log('更新数据:', updateData);
    
    const updateResponse = await fetch(`http://localhost:3001/api/field-defs/${field.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    console.log('更新结果:', updateResult);
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testFieldUpdateAPI();
