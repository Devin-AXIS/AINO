import { z } from 'zod'
import type { FieldDef } from './processors'

// 根据字段定义生成Zod校验器
export function zodFromFields(fields: FieldDef[]) {
  const schema: Record<string, z.ZodTypeAny> = {}
  
  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny
    
    // 根据字段类型生成校验规则
    switch (field.type) {
      case 'text':
        fieldSchema = z.string()
        break
      case 'number':
        fieldSchema = z.number()
        break
      case 'boolean':
        fieldSchema = z.boolean()
        break
      case 'date':
        fieldSchema = z.string().datetime().optional()
        break
      case 'select':
        fieldSchema = z.string()
        break
      case 'multiselect':
        fieldSchema = z.array(z.string())
        break
      case 'json':
        fieldSchema = z.any()
        break
      case 'array':
        fieldSchema = z.array(z.any())
        break
      default:
        fieldSchema = z.any()
    }
    
    // 添加验证规则
    if (field.validators) {
      if (field.validators.min !== undefined && field.type === 'number') {
        fieldSchema = fieldSchema.min(field.validators.min)
      }
      if (field.validators.max !== undefined && field.type === 'number') {
        fieldSchema = fieldSchema.max(field.validators.max)
      }
      if (field.validators.pattern && field.type === 'text') {
        fieldSchema = fieldSchema.regex(new RegExp(field.validators.pattern))
      }
    }
    
    // 处理必填字段
    if (field.required) {
      // 必填字段
    } else {
      fieldSchema = fieldSchema.optional()
    }
    
    schema[field.key] = fieldSchema
  }
  
  return z.object(schema)
}

// 生成部分更新校验器（所有字段都是可选的）
export function zodFromFieldsPartial(fields: FieldDef[]) {
  const schema: Record<string, z.ZodTypeAny> = {}
  
  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny
    
    // 根据字段类型生成校验规则
    switch (field.type) {
      case 'text':
        fieldSchema = z.string()
        break
      case 'number':
        fieldSchema = z.number()
        break
      case 'boolean':
        fieldSchema = z.boolean()
        break
      case 'date':
        fieldSchema = z.string().datetime().optional()
        break
      case 'select':
        fieldSchema = z.string()
        break
      case 'multiselect':
        fieldSchema = z.array(z.string())
        break
      case 'json':
        fieldSchema = z.any()
        break
      case 'array':
        fieldSchema = z.array(z.any())
        break
      default:
        fieldSchema = z.any()
    }
    
    // 添加验证规则
    if (field.validators) {
      if (field.validators.min !== undefined && field.type === 'number') {
        fieldSchema = fieldSchema.min(field.validators.min)
      }
      if (field.validators.max !== undefined && field.type === 'number') {
        fieldSchema = fieldSchema.max(field.validators.max)
      }
      if (field.validators.pattern && field.type === 'text') {
        fieldSchema = fieldSchema.regex(new RegExp(field.validators.pattern))
      }
    }
    
    // 部分更新时所有字段都是可选的
    schema[field.key] = fieldSchema.optional()
  }
  
  return z.object(schema)
}
