import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { openApiConfig, apiRoutes } from './openapi'

// 创建 OpenAPI 应用
const openApiApp = new OpenAPIHono()

// 添加路由定义
openApiApp.openapi(apiRoutes.health, (c) => {
  return c.text('ok')
})

openApiApp.openapi(apiRoutes.login, (c) => {
  // 这里只是文档定义，实际处理在 users/routes.ts 中
  return c.json({
    success: true,
    code: 0,
    message: 'OK',
    data: {
      token: 'example-token',
      user: {
        id: 'u-1',
        email: 'admin@aino.com',
        name: 'Admin',
      },
    },
  })
})

openApiApp.openapi(apiRoutes.getApplications, (c) => {
  // 这里只是文档定义，实际处理在 applications/routes.ts 中
  return c.json({
    success: true,
    data: [
      {
        id: 'app-1',
        name: '示例应用',
        description: '这是一个示例应用',
        slug: 'example-app',
        ownerId: 'u-1',
        status: 'active',
        template: 'blank',
        config: {},
        databaseConfig: {},
        isPublic: false,
        version: '1.0.0',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  })
})

openApiApp.openapi(apiRoutes.createApplication, (c) => {
  // 这里只是文档定义，实际处理在 applications/routes.ts 中
  const data = c.req.valid('json')
  return c.json({
    success: true,
    data: {
      id: 'app-new',
      name: data.name,
      description: data.description,
      slug: data.slug,
      ownerId: 'u-1',
      status: 'active',
      template: data.template,
      config: data.config,
      databaseConfig: {},
      isPublic: data.isPublic,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }, 201)
})

openApiApp.openapi(apiRoutes.getApplication, (c) => {
  // 这里只是文档定义，实际处理在 applications/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    data: {
      id,
      name: '示例应用',
      description: '这是一个示例应用',
      slug: 'example-app',
      ownerId: 'u-1',
      status: 'active',
      template: 'blank',
      config: {},
      databaseConfig: {},
      isPublic: false,
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  })
})

openApiApp.openapi(apiRoutes.updateApplication, (c) => {
  // 这里只是文档定义，实际处理在 applications/routes.ts 中
  const { id } = c.req.valid('param')
  const data = c.req.valid('json')
  return c.json({
    success: true,
    data: {
      id,
      name: data.name || '示例应用',
      description: data.description,
      slug: 'example-app',
      ownerId: 'u-1',
      status: 'active',
      template: 'blank',
      config: data.config || {},
      databaseConfig: {},
      isPublic: data.isPublic || false,
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  })
})

openApiApp.openapi(apiRoutes.deleteApplication, (c) => {
  // 这里只是文档定义，实际处理在 applications/routes.ts 中
  return c.json({
    success: true,
    message: '应用删除成功',
  })
})

// 应用模块相关API
openApiApp.openapi(apiRoutes.getApplicationModules, (c) => {
  // 这里只是文档定义，实际处理在 applications/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    data: {
      application: {
        id,
        name: '示例应用',
        description: '这是一个示例应用',
        slug: 'example-app',
        ownerId: 'u-1',
        status: 'active',
        template: 'blank',
        config: {},
        databaseConfig: {},
        isPublic: false,
        version: '1.0.0',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      modules: [
        {
          id: 'module-1',
          applicationId: id,
          name: '用户管理',
          type: 'system',
          icon: 'users',
          config: {},
          order: 0,
          isEnabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'module-2',
          applicationId: id,
          name: '系统配置',
          type: 'system',
          icon: 'settings',
          config: {},
          order: 1,
          isEnabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
    },
  })
})

// 应用用户相关API
openApiApp.openapi(apiRoutes.getApplicationUsers, (c) => {
  // 这里只是文档定义，实际处理在 application-users/routes.ts 中
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      users: [
        {
          id: 'user-1',
          applicationId: query.applicationId,
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138000',
          avatar: null,
          status: 'active',
          role: 'user',
          department: '技术部',
          position: '开发工程师',
          tags: ['前端', 'React'],
          metadata: {},
          lastLoginAt: '2024-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    },
  })
})

openApiApp.openapi(apiRoutes.createApplicationUser, (c) => {
  // 这里只是文档定义，实际处理在 application-users/routes.ts 中
  const data = c.req.valid('json')
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      id: 'user-new',
      applicationId: query.applicationId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      status: 'active',
      role: data.role,
      department: data.department,
      position: data.position,
      tags: data.tags,
      metadata: data.metadata,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }, 201)
})

openApiApp.openapi(apiRoutes.getApplicationUser, (c) => {
  // 这里只是文档定义，实际处理在 application-users/routes.ts 中
  const { id } = c.req.valid('param')
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      id,
      applicationId: query.applicationId,
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      avatar: null,
      status: 'active',
      role: 'user',
      department: '技术部',
      position: '开发工程师',
      tags: ['前端', 'React'],
      metadata: {},
      lastLoginAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  })
})

openApiApp.openapi(apiRoutes.updateApplicationUser, (c) => {
  // 这里只是文档定义，实际处理在 application-users/routes.ts 中
  const { id } = c.req.valid('param')
  const query = c.req.valid('query')
  const data = c.req.valid('json')
  return c.json({
    success: true,
    data: {
      id,
      applicationId: query.applicationId,
      name: data.name || '张三',
      email: data.email || 'zhangsan@example.com',
      phone: data.phone || '13800138000',
      avatar: data.avatar,
      status: data.status || 'active',
      role: data.role || 'user',
      department: data.department || '技术部',
      position: data.position || '开发工程师',
      tags: data.tags || ['前端', 'React'],
      metadata: data.metadata || {},
      lastLoginAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  })
})

openApiApp.openapi(apiRoutes.deleteApplicationUser, (c) => {
  // 这里只是文档定义，实际处理在 application-users/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    message: `用户 ${id} 已删除`,
  })
})

// 系统模块相关API
openApiApp.openapi(apiRoutes.getSystemModules, (c) => {
  // 这里只是文档定义，实际处理在 modules/routes.ts 中
  return c.json({
    success: true,
    data: [
      {
        id: 'system-user',
        applicationId: 'system',
        name: '用户管理',
        type: 'system',
        icon: 'users',
        config: {
          defaultRole: 'user',
          passwordPolicy: {
            minLength: 6,
            requireNumbers: false,
            requireLowercase: false,
            requireUppercase: false,
            requireSpecialChars: false,
          },
          allowRegistration: true,
          requireEmailVerification: false,
        },
        order: 0,
        isEnabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'system-config',
        applicationId: 'system',
        name: '系统配置',
        type: 'system',
        icon: 'settings',
        config: {},
        order: 1,
        isEnabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'system-audit',
        applicationId: 'system',
        name: '审计日志',
        type: 'system',
        icon: 'activity',
        config: {},
        order: 2,
        isEnabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  })
})

// 目录管理相关API
openApiApp.openapi(apiRoutes.getDirectories, (c) => {
  // 这里只是文档定义，实际处理在 directories/routes.ts 中
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      directories: [
        {
          id: 'dir-1',
          applicationId: query.applicationId || 'app-1',
          moduleId: query.moduleId || 'module-1',
          name: '用户列表',
          type: 'table',
          supportsCategory: false,
          config: { description: '用户管理目录' },
          order: 0,
          isEnabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'dir-2',
          applicationId: query.applicationId || 'app-1',
          moduleId: query.moduleId || 'module-1',
          name: '部门管理',
          type: 'category',
          supportsCategory: true,
          config: { description: '部门分类管理' },
          order: 1,
          isEnabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      },
    },
  })
})

openApiApp.openapi(apiRoutes.createDirectory, (c) => {
  // 这里只是文档定义，实际处理在 directories/routes.ts 中
  const data = c.req.valid('json')
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      id: 'dir-new',
      applicationId: query.applicationId,
      moduleId: query.moduleId,
      name: data.name,
      type: data.type,
      supportsCategory: data.supportsCategory,
      config: data.config,
      order: data.order,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }, 201)
})

openApiApp.openapi(apiRoutes.getDirectory, (c) => {
  // 这里只是文档定义，实际处理在 directories/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    data: {
      id,
      applicationId: 'app-1',
      moduleId: 'module-1',
      name: '用户列表',
      type: 'table',
      supportsCategory: false,
      config: { description: '用户管理目录' },
      order: 0,
      isEnabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  })
})

openApiApp.openapi(apiRoutes.updateDirectory, (c) => {
  // 这里只是文档定义，实际处理在 directories/routes.ts 中
  const { id } = c.req.valid('param')
  const data = c.req.valid('json')
  return c.json({
    success: true,
    data: {
      id,
      applicationId: 'app-1',
      moduleId: 'module-1',
      name: data.name || '用户列表',
      type: data.type || 'table',
      supportsCategory: data.supportsCategory !== undefined ? data.supportsCategory : false,
      config: data.config || { description: '用户管理目录' },
      order: data.order !== undefined ? data.order : 0,
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  })
})

openApiApp.openapi(apiRoutes.deleteDirectory, (c) => {
  // 这里只是文档定义，实际处理在 directories/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    message: `目录 ${id} 删除成功`,
  })
})

// 字段分类相关API
openApiApp.openapi(apiRoutes.getFieldCategories, (c) => {
  // 这里只是文档定义，实际处理在 field-categories/routes.ts 中
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      categories: [
        {
          id: 'cat-1',
          applicationId: query.applicationId || 'app-1',
          directoryId: query.directoryId || 'dir-1',
          name: '基本信息',
          description: '用户基本信息字段',
          order: 0,
          enabled: true,
          system: false,
          predefinedFields: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'cat-2',
          applicationId: query.applicationId || 'app-1',
          directoryId: query.directoryId || 'dir-1',
          name: '联系方式',
          description: '用户联系方式字段',
          order: 1,
          enabled: true,
          system: false,
          predefinedFields: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      },
    },
  })
})

openApiApp.openapi(apiRoutes.createFieldCategory, (c) => {
  // 这里只是文档定义，实际处理在 field-categories/routes.ts 中
  const data = c.req.valid('json')
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      id: 'cat-new',
      applicationId: query.applicationId,
      directoryId: query.directoryId,
      name: data.name,
      description: data.description,
      order: data.order || 0,
      enabled: data.enabled !== undefined ? data.enabled : true,
      system: data.system || false,
      predefinedFields: data.predefinedFields || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }, 201)
})

openApiApp.openapi(apiRoutes.getFieldCategory, (c) => {
  // 这里只是文档定义，实际处理在 field-categories/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    data: {
      id,
      applicationId: 'app-1',
      directoryId: 'dir-1',
      name: '基本信息',
      description: '用户基本信息字段',
      order: 0,
      enabled: true,
      system: false,
      predefinedFields: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  })
})

openApiApp.openapi(apiRoutes.updateFieldCategory, (c) => {
  // 这里只是文档定义，实际处理在 field-categories/routes.ts 中
  const { id } = c.req.valid('param')
  const data = c.req.valid('json')
  return c.json({
    success: true,
    data: {
      id,
      applicationId: 'app-1',
      directoryId: 'dir-1',
      name: data.name || '基本信息',
      description: data.description || '用户基本信息字段',
      order: data.order !== undefined ? data.order : 0,
      enabled: data.enabled !== undefined ? data.enabled : true,
      system: data.system || false,
      predefinedFields: data.predefinedFields || [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  })
})

openApiApp.openapi(apiRoutes.deleteFieldCategory, (c) => {
  // 这里只是文档定义，实际处理在 field-categories/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    message: `字段分类 ${id} 删除成功`,
  })
})

// 字段管理相关API
openApiApp.openapi(apiRoutes.getFields, (c) => {
  // 这里只是文档定义，实际处理在 fields/routes.ts 中
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      fields: [
        {
          id: 'field-1',
          applicationId: query.applicationId || 'app-1',
          directoryId: query.directoryId || 'dir-1',
          categoryId: query.categoryId || 'cat-1',
          key: 'name',
          label: '姓名',
          type: 'text',
          required: true,
          unique: false,
          locked: false,
          enabled: true,
          desc: '用户姓名',
          placeholder: '请输入姓名',
          min: null,
          max: null,
          step: null,
          unit: null,
          options: null,
          default: null,
          showInList: true,
          showInForm: true,
          showInDetail: true,
          trueLabel: null,
          falseLabel: null,
          accept: null,
          maxSizeMB: null,
          relation: null,
          cascaderOptions: null,
          dateMode: null,
          preset: null,
          skillsConfig: null,
          progressConfig: null,
          customExperienceConfig: null,
          identityVerificationConfig: null,
          certificateConfig: null,
          otherVerificationConfig: null,
          imageConfig: null,
          videoConfig: null,
          booleanConfig: null,
          multiselectConfig: null,
          config: {},
          order: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'field-2',
          applicationId: query.applicationId || 'app-1',
          directoryId: query.directoryId || 'dir-1',
          categoryId: query.categoryId || 'cat-1',
          key: 'email',
          label: '邮箱',
          type: 'email',
          required: true,
          unique: true,
          locked: false,
          enabled: true,
          desc: '用户邮箱地址',
          placeholder: '请输入邮箱',
          min: null,
          max: null,
          step: null,
          unit: null,
          options: null,
          default: null,
          showInList: true,
          showInForm: true,
          showInDetail: true,
          trueLabel: null,
          falseLabel: null,
          accept: null,
          maxSizeMB: null,
          relation: null,
          cascaderOptions: null,
          dateMode: null,
          preset: null,
          skillsConfig: null,
          progressConfig: null,
          customExperienceConfig: null,
          identityVerificationConfig: null,
          certificateConfig: null,
          otherVerificationConfig: null,
          imageConfig: null,
          videoConfig: null,
          booleanConfig: null,
          multiselectConfig: null,
          config: {},
          order: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      },
    },
  })
})

openApiApp.openapi(apiRoutes.createField, (c) => {
  // 这里只是文档定义，实际处理在 fields/routes.ts 中
  const data = c.req.valid('json')
  const query = c.req.valid('query')
  return c.json({
    success: true,
    data: {
      id: 'field-new',
      applicationId: query.applicationId,
      directoryId: query.directoryId,
      categoryId: data.categoryId,
      key: data.key,
      label: data.label,
      type: data.type,
      required: data.required || false,
      unique: data.unique || false,
      locked: data.locked || false,
      enabled: data.enabled !== undefined ? data.enabled : true,
      desc: data.desc,
      placeholder: data.placeholder,
      min: data.min,
      max: data.max,
      step: data.step,
      unit: data.unit,
      options: data.options,
      default: data.default,
      showInList: data.showInList !== undefined ? data.showInList : true,
      showInForm: data.showInForm !== undefined ? data.showInForm : true,
      showInDetail: data.showInDetail !== undefined ? data.showInDetail : true,
      trueLabel: data.trueLabel,
      falseLabel: data.falseLabel,
      accept: data.accept,
      maxSizeMB: data.maxSizeMB,
      relation: data.relation,
      cascaderOptions: data.cascaderOptions,
      dateMode: data.dateMode,
      preset: data.preset,
      skillsConfig: data.skillsConfig,
      progressConfig: data.progressConfig,
      customExperienceConfig: data.customExperienceConfig,
      identityVerificationConfig: data.identityVerificationConfig,
      certificateConfig: data.certificateConfig,
      otherVerificationConfig: data.otherVerificationConfig,
      imageConfig: data.imageConfig,
      videoConfig: data.videoConfig,
      booleanConfig: data.booleanConfig,
      multiselectConfig: data.multiselectConfig,
      config: data.config || {},
      order: data.order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }, 201)
})

openApiApp.openapi(apiRoutes.getField, (c) => {
  // 这里只是文档定义，实际处理在 fields/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    data: {
      id,
      applicationId: 'app-1',
      directoryId: 'dir-1',
      categoryId: 'cat-1',
      key: 'name',
      label: '姓名',
      type: 'text',
      required: true,
      unique: false,
      locked: false,
      enabled: true,
      desc: '用户姓名',
      placeholder: '请输入姓名',
      min: null,
      max: null,
      step: null,
      unit: null,
      options: null,
      default: null,
      showInList: true,
      showInForm: true,
      showInDetail: true,
      trueLabel: null,
      falseLabel: null,
      accept: null,
      maxSizeMB: null,
      relation: null,
      cascaderOptions: null,
      dateMode: null,
      preset: null,
      skillsConfig: null,
      progressConfig: null,
      customExperienceConfig: null,
      identityVerificationConfig: null,
      certificateConfig: null,
      otherVerificationConfig: null,
      imageConfig: null,
      videoConfig: null,
      booleanConfig: null,
      multiselectConfig: null,
      config: {},
      order: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  })
})

openApiApp.openapi(apiRoutes.updateField, (c) => {
  // 这里只是文档定义，实际处理在 fields/routes.ts 中
  const { id } = c.req.valid('param')
  const data = c.req.valid('json')
  return c.json({
    success: true,
    data: {
      id,
      applicationId: 'app-1',
      directoryId: 'dir-1',
      categoryId: data.categoryId || 'cat-1',
      key: data.key || 'name',
      label: data.label || '姓名',
      type: data.type || 'text',
      required: data.required !== undefined ? data.required : true,
      unique: data.unique !== undefined ? data.unique : false,
      locked: data.locked !== undefined ? data.locked : false,
      enabled: data.enabled !== undefined ? data.enabled : true,
      desc: data.desc || '用户姓名',
      placeholder: data.placeholder || '请输入姓名',
      min: data.min,
      max: data.max,
      step: data.step,
      unit: data.unit,
      options: data.options,
      default: data.default,
      showInList: data.showInList !== undefined ? data.showInList : true,
      showInForm: data.showInForm !== undefined ? data.showInForm : true,
      showInDetail: data.showInDetail !== undefined ? data.showInDetail : true,
      trueLabel: data.trueLabel,
      falseLabel: data.falseLabel,
      accept: data.accept,
      maxSizeMB: data.maxSizeMB,
      relation: data.relation,
      cascaderOptions: data.cascaderOptions,
      dateMode: data.dateMode,
      preset: data.preset,
      skillsConfig: data.skillsConfig,
      progressConfig: data.progressConfig,
      customExperienceConfig: data.customExperienceConfig,
      identityVerificationConfig: data.identityVerificationConfig,
      certificateConfig: data.certificateConfig,
      otherVerificationConfig: data.otherVerificationConfig,
      imageConfig: data.imageConfig,
      videoConfig: data.videoConfig,
      booleanConfig: data.booleanConfig,
      multiselectConfig: data.multiselectConfig,
      config: data.config || {},
      order: data.order !== undefined ? data.order : 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  })
})

openApiApp.openapi(apiRoutes.deleteField, (c) => {
  // 这里只是文档定义，实际处理在 fields/routes.ts 中
  const { id } = c.req.valid('param')
  return c.json({
    success: true,
    message: `字段 ${id} 删除成功`,
  })
})

// 生成 OpenAPI 规范
const openApiDoc = openApiApp.getOpenAPIDocument(openApiConfig)

// 创建文档路由
export const docsRoute = new OpenAPIHono()

// Swagger UI
docsRoute.get('/swagger', swaggerUI({ url: '/docs/openapi.json' }))

// OpenAPI JSON
docsRoute.get('/openapi.json', (c) => {
  return c.json(openApiDoc)
})

// 重定向根路径到 Swagger UI
docsRoute.get('/', (c) => {
  return c.redirect('/docs/swagger')
})

export { openApiApp }
