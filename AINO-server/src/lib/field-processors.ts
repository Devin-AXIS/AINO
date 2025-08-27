import { z } from 'zod'

// 字段类型定义
export type FieldKind = 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
export type FieldType = 'text' | 'number' | 'email' | 'phone' | 'select' | 'multiselect' | 'date' | 'datetime' | 'boolean' | 'textarea' | 'image' | 'file' | 'json'

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
      if (value && fieldDef.schema?.options && !fieldDef.schema.options.includes(value)) {
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
      if (fieldDef.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value) {
        // 如果是字符串，进行URL验证
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            new URL(value)
          } catch {
            return { valid: false, error: '图片URL格式不正确' }
          }
        }
        
        // 验证文件大小（如果提供了文件大小信息）
        if (fieldDef.validators?.maxSizeMB && typeof value === 'object' && value.size) {
          const maxSizeBytes = fieldDef.validators.maxSizeMB * 1024 * 1024
          if (value.size > maxSizeBytes) {
            return { valid: false, error: `图片大小不能超过${fieldDef.validators.maxSizeMB}MB` }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 文件字段
  file: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value) {
        // 如果是字符串，进行URL验证
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            new URL(value)
          } catch {
            return { valid: false, error: '文件URL格式不正确' }
          }
        }
        
        // 验证文件大小（如果提供了文件大小信息）
        if (fieldDef.validators?.maxSizeMB && typeof value === 'object' && value.size) {
          const maxSizeBytes = fieldDef.validators.maxSizeMB * 1024 * 1024
          if (value.size > maxSizeBytes) {
            return { valid: false, error: `文件大小不能超过${fieldDef.validators.maxSizeMB}MB` }
          }
        }
        
        // 验证文件类型（如果提供了接受的文件类型）
        if (fieldDef.validators?.accept && typeof value === 'object' && value.type) {
          const acceptTypes = fieldDef.validators.accept.split(',').map(t => t.trim())
          const fileType = value.type
          const isAccepted = acceptTypes.some(acceptType => {
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
