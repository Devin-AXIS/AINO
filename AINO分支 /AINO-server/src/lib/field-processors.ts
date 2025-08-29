import { z } from 'zod'

// 字段类型定义
export type FieldKind = 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
export type FieldType = 'text' | 'number' | 'email' | 'phone' | 'select' | 'multiselect' | 'date' | 'datetime' | 'boolean' | 'textarea' | 'image' | 'multiimage' | 'video' | 'file' | 'json' | 'table' | 'tags' | 'experience'

// 字段定义接口
export interface FieldDef {
  id: string
  key: string
  kind: FieldKind
  type: FieldType
  schema?: any
  relation?: any
  lookup?: any
  computed?: any
  validators?: any
  readRoles?: string[]
  writeRoles?: string[]
  required?: boolean
}

// 字段处理器接口
export interface FieldProcessor {
  validate: (value: any, fieldDef: FieldDef) => { valid: boolean; error?: string }
  transform: (value: any, fieldDef: FieldDef) => any
  format: (value: any, fieldDef: FieldDef) => any
}

// 基础字段处理器
export const baseFieldProcessors: Record<FieldType, FieldProcessor> = {
  // 文本字段
  text: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && typeof value !== 'string') {
        return { valid: false, error: '必须是文本类型' }
      }

      // 验证长度限制
      if (value && fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.minLength && value.length < validators.minLength) {
          return { valid: false, error: `文本长度不能少于${validators.minLength}个字符` }
        }
        if (validators.maxLength && value.length > validators.maxLength) {
          return { valid: false, error: `文本长度不能超过${validators.maxLength}个字符` }
        }
        if (validators.pattern) {
          const regex = new RegExp(validators.pattern)
          if (!regex.test(value)) {
            return { valid: false, error: '文本格式不符合要求' }
          }
        }
      }

      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 数字字段
  number: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (value === null || value === undefined || value === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value !== null && value !== undefined && value !== '') {
        const num = Number(value)
        if (isNaN(num)) {
          return { valid: false, error: '必须是数字类型' }
        }

        // 验证数值范围
        if (fieldDef.validators) {
          const validators = fieldDef.validators
          if (validators.min !== undefined && num < validators.min) {
            return { valid: false, error: `数值不能小于${validators.min}` }
          }
          if (validators.max !== undefined && num > validators.max) {
            return { valid: false, error: `数值不能大于${validators.max}` }
          }
          if (validators.step !== undefined) {
            const remainder = (num - (validators.min || 0)) % validators.step
            if (Math.abs(remainder) > 0.0001) {
              return { valid: false, error: `数值必须是${validators.step}的倍数` }
            }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined || value === '') return null
      return Number(value)
    },
    format: (value) => value
  },

  // 邮箱字段
  email: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return { valid: false, error: '邮箱格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim().toLowerCase() : value,
    format: (value) => value
  },

  // 手机号字段
  phone: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const phoneRegex = /^1[3-9]\d{9}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return { valid: false, error: '手机号格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).replace(/\s/g, '') : value,
    format: (value) => value
  },

  // 选择字段
  select: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      // 对于preset字段，跳过options验证，因为选项由前端组件提供
      if (value && fieldDef.schema?.options && fieldDef.schema.options.length > 0 && !fieldDef.schema.preset && !fieldDef.schema.options.includes(value)) {
        return { valid: false, error: '选择的值不在允许的选项中' }
      }
      return { valid: true }
    },
    transform: (value) => value,
    format: (value) => value
  },

  // 多选字段
  multiselect: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || !Array.isArray(value) || value.length === 0)) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && Array.isArray(value)) {
        // 验证选项是否在允许范围内
        if (fieldDef.schema?.options) {
          const invalidValues = value.filter(v => !fieldDef.schema.options.includes(v))
          if (invalidValues.length > 0) {
            return { valid: false, error: '包含不允许的选项' }
          }
        }

        // 验证数量限制
        if (fieldDef.validators) {
          const validators = fieldDef.validators
          if (validators.minItems && value.length < validators.minItems) {
            return { valid: false, error: `至少需要选择${validators.minItems}项` }
          }
          if (validators.maxItems && value.length > validators.maxItems) {
            return { valid: false, error: `最多只能选择${validators.maxItems}项` }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => Array.isArray(value) ? value : value ? [value] : [],
    format: (value) => Array.isArray(value) ? value : []
  },

  // 日期字段
  date: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return { valid: false, error: '日期格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value || value.trim() === '') return null
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
    },
    format: (value) => value
  },

  // 日期时间字段
  datetime: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return { valid: false, error: '日期时间格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value || value.trim() === '') return null
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date.toISOString()
    },
    format: (value) => value
  },

  // 布尔字段
  boolean: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && value === null && value === undefined) {
        return { valid: false, error: '此字段为必填项' }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined) return null
      return Boolean(value)
    },
    format: (value) => value
  },

  // 文本域字段
  textarea: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && typeof value !== 'string') {
        return { valid: false, error: '必须是文本类型' }
      }

      // 验证长度限制
      if (value && fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.minLength && value.length < validators.minLength) {
          return { valid: false, error: `文本长度不能少于${validators.minLength}个字符` }
        }
        if (validators.maxLength && value.length > validators.maxLength) {
          return { valid: false, error: `文本长度不能超过${validators.maxLength}个字符` }
        }
      }

      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 图片字段
  image: {
    validate: (value, fieldDef) => {
      const isArrayInput = Array.isArray(value)
      const values = isArrayInput ? value : [value]

      if (fieldDef.required && (!value || (isArrayInput && values.length === 0))) {
        return { valid: false, error: '此字段为必填项' }
      }

      for (const v of values) {
        if (!v) continue
        if (typeof v === 'string' && v.trim() !== '') {
          const s = v.trim()
          const isHttp = s.startsWith('http://') || s.startsWith('https://')
          const isData = s.startsWith('data:image/')
          if (!isHttp && !isData) {
            try { new URL(s) } catch { return { valid: false, error: '图片URL格式不正确' } }
          }
        }

        // 验证文件大小（如果提供了文件大小信息）
        if (fieldDef.validators?.maxSizeMB && typeof v === 'object' && (v as any).size) {
          const maxSizeBytes = fieldDef.validators.maxSizeMB * 1024 * 1024
          if ((v as any).size > maxSizeBytes) {
            return { valid: false, error: `图片大小不能超过${fieldDef.validators.maxSizeMB}MB` }
          }
        }
      }

      return { valid: true }
    },
    transform: (value, fieldDef) => {
      // 若前端启用多图（schema.imageConfig.multiple=true）或实际传入数组，则统一存为字符串数组
      const multiple = Boolean((fieldDef as any)?.schema?.imageConfig?.multiple)
      if (Array.isArray(value) || multiple) {
        const arr = Array.isArray(value) ? value : (value ? [value] : [])
        return arr
          .map((v) => (v == null ? '' : String(v).trim()))
          .filter((v) => v.length > 0)
      }
      return value ? String(value).trim() : value
    },
    format: (value) => value
  },

  // 多图片字段
  multiimage: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || (Array.isArray(value) && value.length === 0))) {
        return { valid: false, error: '此字段为必填项' }
      }

      if (value) {
        const arr = Array.isArray(value) ? value : [value]
        for (const v of arr) {
          if (typeof v !== 'string' || v.trim() === '') {
            return { valid: false, error: '图片地址必须是非空文本' }
          }
          const s = v.trim()
          // 允许 http(s) 与 data URL
          const isHttp = s.startsWith('http://') || s.startsWith('https://')
          const isData = s.startsWith('data:image/')
          if (!isHttp && !isData) {
            try {
              // 兜底用 URL 解析（兼容其他协议）
              new URL(s)
            } catch {
              return { valid: false, error: '图片URL格式不正确' }
            }
          }
        }

        // 数量限制
        if (fieldDef.validators) {
          const { minItems, maxItems } = fieldDef.validators
          const len = arr.length
          if (minItems && len < minItems) {
            return { valid: false, error: `至少需要上传${minItems}张图片` }
          }
          if (maxItems && len > maxItems) {
            return { valid: false, error: `最多只能上传${maxItems}张图片` }
          }
        }
      }

      return { valid: true }
    },
    transform: (value) => {
      if (!value) return []
      const arr = Array.isArray(value) ? value : [value]
      return arr
        .map((v) => (v == null ? '' : String(v).trim()))
        .filter((v) => v.length > 0)
    },
    format: (value) => value
  },

  // 视频字段（支持单个或多个，受 schema.videoConfig.multiple 控制）
  video: {
    validate: (value, fieldDef) => {
      const isArrayInput = Array.isArray(value)
      const values = isArrayInput ? value : [value]

      if (fieldDef.required && (!value || (isArrayInput && values.length === 0))) {
        return { valid: false, error: '此字段为必填项' }
      }

      for (const v of values) {
        if (!v) continue
        if (typeof v === 'string' && v.trim() !== '') {
          const s = v.trim()
          const isHttp = s.startsWith('http://') || s.startsWith('https://')
          const isData = s.startsWith('data:video/')
          const isUploadsRelative = s.startsWith('/uploads/') || s.startsWith('uploads/')
          if (!isHttp && !isData && !isUploadsRelative) {
            try { new URL(s) } catch { return { valid: false, error: '视频URL格式不正确' } }
          }
        }
      }

      // 数量限制（如果提供）
      if (fieldDef.validators && Array.isArray(values)) {
        const { minItems, maxItems } = fieldDef.validators as any
        const len = values.filter(Boolean).length
        if (minItems && len < minItems) {
          return { valid: false, error: `至少需要上传${minItems}个视频` }
        }
        if (maxItems && len > maxItems) {
          return { valid: false, error: `最多只能上传${maxItems}个视频` }
        }
      }

      return { valid: true }
    },
    transform: (value, fieldDef) => {
      const multiple = Boolean((fieldDef as any)?.schema?.videoConfig?.multiple)
      if (Array.isArray(value) || multiple) {
        const arr = Array.isArray(value) ? value : (value ? [value] : [])
        return arr
          .map((v) => (v == null ? '' : String(v).trim()))
          .filter((v) => v.length > 0)
      }
      return value ? String(value).trim() : value
    },
    format: (value) => value
  },

  // 文件字段
  file: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value) {
        // 如果是字符串，放宽为接受任意非空字符串（文件名、相对路径、URL 等均可）
        // 不再对字符串进行 URL 强校验

        // 验证文件大小（如果提供了文件大小信息）
        if (fieldDef.validators?.maxSizeMB && typeof value === 'object' && value.size) {
          const maxSizeBytes = fieldDef.validators.maxSizeMB * 1024 * 1024
          if (value.size > maxSizeBytes) {
            return { valid: false, error: `文件大小不能超过${fieldDef.validators.maxSizeMB}MB` }
          }
        }

        // 验证文件类型（如果提供了接受的文件类型）
        if (fieldDef.validators?.accept && typeof value === 'object' && value.type) {
          const acceptTypes = fieldDef.validators.accept.split(',').map((t: string) => t.trim())
          const fileType = value.type
          const isAccepted = acceptTypes.some((acceptType: string) => {
            if (acceptType.endsWith('/*')) {
              return fileType.startsWith(acceptType.slice(0, -1))
            }
            return fileType === acceptType
          })
          if (!isAccepted) {
            return { valid: false, error: '不支持的文件类型' }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // JSON字段
  json: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (value === null || value === undefined)) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value !== null && value !== undefined) {
        try {
          if (typeof value === 'string') {
            JSON.parse(value)
          }
        } catch {
          return { valid: false, error: 'JSON格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
      return value
    },
    format: (value) => value
  },

  // 表格字段（兼容text类型）
  table: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && typeof value !== 'string') {
        return { valid: false, error: '必须是文本类型' }
      }

      // 验证长度限制
      if (value && fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.minLength && value.length < validators.minLength) {
          return { valid: false, error: `文本长度不能少于${validators.minLength}个字符` }
        }
        if (validators.maxLength && value.length > validators.maxLength) {
          return { valid: false, error: `文本长度不能超过${validators.maxLength}个字符` }
        }
        if (validators.pattern) {
          const regex = new RegExp(validators.pattern)
          if (!regex.test(value)) {
            return { valid: false, error: '文本格式不符合要求' }
          }
        }
      }

      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 标签字段
  tags: {
    validate: (value, fieldDef) => {
      // 标签字段可以为空
      if (!value) {
        return { valid: true }
      }

      // 验证是否为数组
      if (!Array.isArray(value)) {
        return { valid: false, error: '标签必须是数组格式' }
      }

      // 验证每个标签
      for (let i = 0; i < value.length; i++) {
        const tag = value[i]
        if (typeof tag !== 'string') {
          return { valid: false, error: `标签${i + 1}必须是文本类型` }
        }
        if (tag.trim() === '') {
          return { valid: false, error: `标签${i + 1}不能为空` }
        }
        if (tag.length > 50) {
          return { valid: false, error: `标签${i + 1}长度不能超过50个字符` }
        }
      }

      // 验证标签数量限制
      if (fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.maxTags && value.length > validators.maxTags) {
          return { valid: false, error: `标签数量不能超过${validators.maxTags}个` }
        }
        if (validators.minTags && value.length < validators.minTags) {
          return { valid: false, error: `标签数量不能少于${validators.minTags}个` }
        }
      }

      return { valid: true }
    },
    transform: (value) => {
      // 确保返回数组格式
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(tag => tag.trim()).filter(tag => tag.length > 0)
      }
      return []
    },
    format: (value) => value
  },

  // 经历字段
  experience: {
    validate: (value, fieldDef) => {
      // 经历字段可以为空
      if (!value) {
        return { valid: true }
      }

      // 验证是否为数组
      if (!Array.isArray(value)) {
        return { valid: false, error: '经历必须是数组格式' }
      }

      // 验证每个经历项
      for (let i = 0; i < value.length; i++) {
        const experience = value[i]
        if (typeof experience !== 'object' || experience === null) {
          return { valid: false, error: `经历${i + 1}必须是对象格式` }
        }

        // 验证必需字段
        if (!experience.id || typeof experience.id !== 'string') {
          return { valid: false, error: `经历${i + 1}缺少有效的ID` }
        }

        if (!experience.type || typeof experience.type !== 'string') {
          return { valid: false, error: `经历${i + 1}缺少类型信息` }
        }

        // 标题和组织信息可以为空（当经历还在编辑中时）
        if (experience.title && typeof experience.title !== 'string') {
          return { valid: false, error: `经历${i + 1}的标题格式不正确` }
        }

        if (experience.organization && typeof experience.organization !== 'string') {
          return { valid: false, error: `经历${i + 1}的组织信息格式不正确` }
        }

        // 开始日期可以为空（当经历还在编辑中时）
        if (experience.startDate && typeof experience.startDate !== 'string') {
          return { valid: false, error: `经历${i + 1}的开始日期格式不正确` }
        }

        // 验证日期格式（只有当startDate不为空时才验证）
        if (experience.startDate && experience.startDate.trim() !== '') {
          const startDate = new Date(experience.startDate)
          if (isNaN(startDate.getTime())) {
            return { valid: false, error: `经历${i + 1}的开始日期格式不正确` }
          }
        }

        // 如果有结束日期，验证格式
        if (experience.endDate && experience.endDate.trim() !== '') {
          const endDate = new Date(experience.endDate)
          if (isNaN(endDate.getTime())) {
            return { valid: false, error: `经历${i + 1}的结束日期格式不正确` }
          }
        }

        // 验证技能数组（如果存在）
        if (experience.skills && !Array.isArray(experience.skills)) {
          return { valid: false, error: `经历${i + 1}的技能必须是数组格式` }
        }

        // 验证成就数组（如果存在）
        if (experience.achievements && !Array.isArray(experience.achievements)) {
          return { valid: false, error: `经历${i + 1}的成就必须是数组格式` }
        }
      }

      // 验证经历数量限制
      if (fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.maxItems && value.length > validators.maxItems) {
          return { valid: false, error: `经历数量不能超过${validators.maxItems}个` }
        }
        if (validators.minItems && value.length < validators.minItems) {
          return { valid: false, error: `经历数量不能少于${validators.minItems}个` }
        }
      }

      return { valid: true }
    },
    transform: (value) => {
      // 确保返回数组格式
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(experience => {
          // 清理和标准化经历数据
          const cleaned = {
            id: experience.id?.trim() || '',
            type: experience.type?.trim() || '',
            title: experience.title?.trim() || '',
            organization: experience.organization?.trim() || '',
            startDate: experience.startDate?.trim() || '',
            endDate: experience.endDate?.trim() || null,
            isCurrent: Boolean(experience.isCurrent),
            description: experience.description?.trim() || null,
            location: experience.location?.trim() || null,
            skills: Array.isArray(experience.skills) ? experience.skills.filter((s: string) => s && s.trim()) : [],
            achievements: Array.isArray(experience.achievements) ? experience.achievements.filter((a: string) => a && a.trim()) : [],
            // 教育经历特有字段
            degree: experience.degree?.trim() || null,
            major: experience.major?.trim() || null,
            gpa: experience.gpa?.trim() || null,
            // 工作经历特有字段
            department: experience.department?.trim() || null,
            salary: experience.salary?.trim() || null,
            // 项目经历特有字段
            projectUrl: experience.projectUrl?.trim() || null,
            teamSize: typeof experience.teamSize === 'number' ? experience.teamSize : null,
            // 证书特有字段
            issuer: experience.issuer?.trim() || null,
            credentialId: experience.credentialId?.trim() || null,
            expiryDate: experience.expiryDate?.trim() || null
          }

          // 移除空值字段
          Object.keys(cleaned).forEach(key => {
            if ((cleaned as any)[key] === null || (cleaned as any)[key] === '') {
              delete (cleaned as any)[key]
            }
          })

          return cleaned
        })
      }
      return []
    },
    format: (value) => value
  }
}

// 字段处理器管理器
export class FieldProcessorManager {
  private processors: Record<FieldType, FieldProcessor> = baseFieldProcessors

  // 注册自定义处理器
  registerProcessor(type: FieldType, processor: FieldProcessor) {
    this.processors[type] = processor
  }

  // 获取处理器
  getProcessor(type: FieldType): FieldProcessor {
    return this.processors[type] || baseFieldProcessors.text
  }

  // 验证字段值
  validateField(value: any, fieldDef: FieldDef): { valid: boolean; error?: string } {
    const processor = this.getProcessor(fieldDef.type)
    return processor.validate(value, fieldDef)
  }

  // 转换字段值
  transformField(value: any, fieldDef: FieldDef): any {
    const processor = this.getProcessor(fieldDef.type)
    return processor.transform(value, fieldDef)
  }

  // 格式化字段值
  formatField(value: any, fieldDef: FieldDef): any {
    const processor = this.getProcessor(fieldDef.type)
    return processor.format(value, fieldDef)
  }

  // 批量验证记录
  validateRecord(record: Record<string, any>, fieldDefs: FieldDef[]): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}
    let valid = true

    for (const fieldDef of fieldDefs) {
      const value = record[fieldDef.key]
      const validation = this.validateField(value, fieldDef)

      if (!validation.valid) {
        errors[fieldDef.key] = validation.error!
        valid = false
      }
    }

    return { valid, errors }
  }

  // 批量转换记录
  transformRecord(record: Record<string, any>, fieldDefs: FieldDef[]): Record<string, any> {
    const transformed: Record<string, any> = {}

    for (const fieldDef of fieldDefs) {
      const value = record[fieldDef.key]
      transformed[fieldDef.key] = this.transformField(value, fieldDef)
    }

    return transformed
  }
}

// 导出默认实例
export const fieldProcessorManager = new FieldProcessorManager()

// =============== 自定义预设处理器（基于 schema.preset 路由） ===============
// 说明：某些前端预设（如 实名认证/其他认证）目前可能将后端字段类型设置为 text。
// 这类字段在保存时会传入对象结构。为兼容现有数据，我们在此基于 schema.preset 做定制处理。

const identityVerificationProcessor: FieldProcessor = {
  validate: (value, fieldDef) => {
    const isEmptyObject = (v: any) => v && typeof v === 'object' && Object.keys(v).length === 0
    if (value == null || value === '' || isEmptyObject(value)) {
      if (fieldDef.required) return { valid: false, error: '此字段为必填项' }
      return { valid: true }
    }
    if (typeof value !== 'object') {
      return { valid: false, error: '实名认证数据格式应为对象' }
    }
    const v = value as any
    if (v.name != null && typeof v.name !== 'string') {
      return { valid: false, error: '姓名必须为文本' }
    }
    if (v.idNumber != null && typeof v.idNumber !== 'string') {
      return { valid: false, error: '身份证号必须为文本' }
    }
    if (v.frontPhoto != null && typeof v.frontPhoto !== 'string') {
      return { valid: false, error: '身份证正面照片必须为字符串URL或Base64' }
    }
    if (v.backPhoto != null && typeof v.backPhoto !== 'string') {
      return { valid: false, error: '身份证反面照片必须为字符串URL或Base64' }
    }
    return { valid: true }
  },
  transform: (value) => {
    if (value == null || value === '') return null
    if (typeof value !== 'object') return null
    const v = value as any
    const out: any = {}
    const trimStr = (s: any) => (typeof s === 'string' ? s.trim() : s)
    if (v.name) out.name = trimStr(v.name)
    if (v.idNumber) out.idNumber = trimStr(v.idNumber)
    if (v.frontPhoto) out.frontPhoto = trimStr(v.frontPhoto)
    if (v.backPhoto) out.backPhoto = trimStr(v.backPhoto)
    return Object.keys(out).length > 0 ? out : null
  },
  format: (value) => value,
}

const otherVerificationProcessor: FieldProcessor = {
  validate: (value, fieldDef) => {
    const isEmptyObject = (v: any) => v && typeof v === 'object' && Object.keys(v).length === 0
    if (value == null || value === '' || isEmptyObject(value)) {
      if (fieldDef.required) return { valid: false, error: '此字段为必填项' }
      return { valid: true }
    }
    if (typeof value !== 'object') {
      return { valid: false, error: '认证数据格式应为对象' }
    }
    // 放宽为任意键：字符串或字符串数组
    const v = value as any
    for (const key of Object.keys(v)) {
      const item = v[key]
      if (
        !(typeof item === 'string' || (Array.isArray(item) && item.every((x) => typeof x === 'string')))
      ) {
        return { valid: false, error: `字段 ${key} 的值必须为字符串或字符串数组` }
      }
    }
    return { valid: true }
  },
  transform: (value) => {
    if (value == null || value === '') return null
    if (typeof value !== 'object') return null
    const v = value as any
    const out: any = {}
    const trimStr = (s: any) => (typeof s === 'string' ? s.trim() : s)
    for (const key of Object.keys(v)) {
      const item = v[key]
      if (typeof item === 'string') {
        const t = trimStr(item)
        if (t) out[key] = t
      } else if (Array.isArray(item)) {
        const arr = item.map(trimStr).filter((x) => typeof x === 'string' && x.length > 0)
        if (arr.length > 0) out[key] = arr
      }
    }
    return Object.keys(out).length > 0 ? out : null
  },
  format: (value) => value,
}

// 包装默认的 getProcessor：基于 preset 返回自定义处理器
const originalGetProcessor = fieldProcessorManager.getProcessor.bind(fieldProcessorManager)
fieldProcessorManager.getProcessor = function (type: FieldType): FieldProcessor {
  // 注意：此处依赖调用方在传递 fieldDef 时保存 schema 信息。
  // 通过闭包访问不到 fieldDef，因此我们在 validate/transform 批量函数里进行 preset 分流。
  return originalGetProcessor(type)
}

// 覆盖批量验证/转换以支持基于 preset 的处理
const originalValidateField = fieldProcessorManager.validateField.bind(fieldProcessorManager)
const originalTransformField = fieldProcessorManager.transformField.bind(fieldProcessorManager)

fieldProcessorManager.validateField = function (value: any, fieldDef: FieldDef) {
  const preset = (fieldDef as any)?.schema?.preset
  if (preset === 'identity_verification') {
    return identityVerificationProcessor.validate(value, fieldDef)
  }
  if (preset === 'other_verification') {
    return otherVerificationProcessor.validate(value, fieldDef)
  }
  return originalValidateField(value, fieldDef)
}

fieldProcessorManager.transformField = function (value: any, fieldDef: FieldDef) {
  const preset = (fieldDef as any)?.schema?.preset
  if (preset === 'identity_verification') {
    return identityVerificationProcessor.transform(value, fieldDef)
  }
  if (preset === 'other_verification') {
    return otherVerificationProcessor.transform(value, fieldDef)
  }
  return originalTransformField(value, fieldDef)
}
