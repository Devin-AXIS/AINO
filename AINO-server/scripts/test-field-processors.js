const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

// 模拟字段定义
const mockFieldDefs = [
  {
    id: '1',
    key: 'name',
    kind: 'primitive',
    type: 'text',
    required: true
  },
  {
    id: '2',
    key: 'email',
    kind: 'primitive',
    type: 'email',
    required: true
  },
  {
    id: '3',
    key: 'phone',
    kind: 'primitive',
    type: 'phone',
    required: false
  },
  {
    id: '4',
    key: 'age',
    kind: 'primitive',
    type: 'number',
    required: false
  },
  {
    id: '5',
    key: 'role',
    kind: 'primitive',
    type: 'select',
    required: true,
    schema: {
      options: ['admin', 'user', 'guest']
    }
  },
  {
    id: '6',
    key: 'skills',
    kind: 'primitive',
    type: 'multiselect',
    required: false,
    schema: {
      options: ['JavaScript', 'React', 'Node.js', 'Python', 'Java']
    }
  },
  {
    id: '7',
    key: 'birthDate',
    kind: 'primitive',
    type: 'date',
    required: false
  },
  {
    id: '8',
    key: 'isActive',
    kind: 'primitive',
    type: 'boolean',
    required: false
  }
]

async function testFieldProcessors() {
  console.log('🧪 测试字段处理器...\n')
  
  // 测试用例1：有效数据
  console.log('1. 测试有效数据...')
  const validRecord = {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    age: 25,
    role: 'admin',
    skills: ['JavaScript', 'React'],
    birthDate: '1998-01-01',
    isActive: true
  }
  
  const validation1 = fieldProcessorManager.validateRecord(validRecord, mockFieldDefs)
  console.log('   验证结果:', validation1.valid ? '✅ 通过' : '❌ 失败')
  if (!validation1.valid) {
    console.log('   错误信息:', validation1.errors)
  }
  
  const transformed1 = fieldProcessorManager.transformRecord(validRecord, mockFieldDefs)
  console.log('   转换结果:', transformed1)
  
  // 测试用例2：无效数据
  console.log('\n2. 测试无效数据...')
  const invalidRecord = {
    name: '', // 必填字段为空
    email: 'invalid-email', // 无效邮箱
    phone: '123', // 无效手机号
    age: 'not-a-number', // 无效数字
    role: 'invalid-role', // 不在选项中的角色
    skills: ['InvalidSkill'], // 不在选项中的技能
    birthDate: 'invalid-date', // 无效日期
    isActive: 'not-boolean' // 无效布尔值
  }
  
  const validation2 = fieldProcessorManager.validateRecord(invalidRecord, mockFieldDefs)
  console.log('   验证结果:', validation2.valid ? '✅ 通过' : '❌ 失败')
  if (!validation2.valid) {
    console.log('   错误信息:', validation2.errors)
  }
  
  // 测试用例3：单个字段验证
  console.log('\n3. 测试单个字段验证...')
  
  // 测试邮箱验证
  const emailValidation = fieldProcessorManager.validateField('test@example.com', mockFieldDefs[1])
  console.log('   邮箱验证 (test@example.com):', emailValidation.valid ? '✅ 通过' : '❌ 失败')
  
  const invalidEmailValidation = fieldProcessorManager.validateField('invalid-email', mockFieldDefs[1])
  console.log('   邮箱验证 (invalid-email):', invalidEmailValidation.valid ? '✅ 通过' : '❌ 失败')
  
  // 测试手机号验证
  const phoneValidation = fieldProcessorManager.validateField('13800138000', mockFieldDefs[2])
  console.log('   手机号验证 (13800138000):', phoneValidation.valid ? '✅ 通过' : '❌ 失败')
  
  const invalidPhoneValidation = fieldProcessorManager.validateField('123', mockFieldDefs[2])
  console.log('   手机号验证 (123):', invalidPhoneValidation.valid ? '✅ 通过' : '❌ 失败')
  
  // 测试用例4：字段转换
  console.log('\n4. 测试字段转换...')
  
  // 测试数字转换
  const numberTransform = fieldProcessorManager.transformField('25', mockFieldDefs[3])
  console.log('   数字转换 ("25"):', numberTransform, typeof numberTransform)
  
  // 测试手机号转换（去除空格）
  const phoneTransform = fieldProcessorManager.transformField('138 0013 8000', mockFieldDefs[2])
  console.log('   手机号转换 ("138 0013 8000"):', phoneTransform)
  
  // 测试邮箱转换（转小写）
  const emailTransform = fieldProcessorManager.transformField('TEST@EXAMPLE.COM', mockFieldDefs[1])
  console.log('   邮箱转换 ("TEST@EXAMPLE.COM"):', emailTransform)
  
  // 测试多选转换
  const multiselectTransform = fieldProcessorManager.transformField('JavaScript', mockFieldDefs[5])
  console.log('   多选转换 ("JavaScript"):', multiselectTransform)
  
  console.log('\n🎉 字段处理器测试完成！')
}

// 运行测试
testFieldProcessors()
