import { db } from './index'
import { users } from './schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...')
    
    // 检查是否已有管理员用户
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@aino.com')).limit(1)
    
    if (existingAdmin.length === 0) {
      // 创建管理员用户
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await db.insert(users).values({
        id: 'admin-001',
        name: '管理员',
        email: 'admin@aino.com',
        password: hashedPassword,
        avatar: '/diverse-user-avatars.png',
        roles: ['admin'],
      })
      
      console.log('✅ Admin user created: admin@aino.com / admin123')
    } else {
      console.log('ℹ️ Admin user already exists')
    }
    
    // 检查是否已有测试用户
    const existingTest = await db.select().from(users).where(eq(users.email, 'test@aino.com')).limit(1)
    
    if (existingTest.length === 0) {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash('test123', 10)
      
      await db.insert(users).values({
        id: 'test-001',
        name: '测试用户',
        email: 'test@aino.com',
        password: hashedPassword,
        avatar: '/generic-user-avatar.png',
        roles: ['user'],
      })
      
      console.log('✅ Test user created: test@aino.com / test123')
    } else {
      console.log('ℹ️ Test user already exists')
    }
    
    console.log('🎉 Database seeding completed!')
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0))
}
