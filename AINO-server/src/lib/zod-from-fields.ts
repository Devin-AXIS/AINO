import { z, ZodObject } from 'zod'
import type { FieldDef } from './meta'

export function zodFromFields(fields: FieldDef[]): ZodObject<any> {
  const shape: Record<string, any> = {}
  
  for (const f of fields) {
    let base: any
    
    switch (f.type) {
      case 'text': 
        base = z.string()
        break
      case 'number': 
        base = z.coerce.number()
        break
      case 'boolean': 
        base = z.boolean()
        break
      case 'date': 
        base = z.string().datetime().or(z.string())
        break
      case 'json': 
        base = z.any()
        break
      case 'email':
        base = z.string().email()
        break
      case 'url':
        base = z.string().url()
        break
      case 'phone':
        base = z.string()
        break
      default: 
        base = z.any()
    }
    
    if (f.kind === 'composite' && f.schema) {
      // 简化：合规时可将 JSON Schema 转 zod，这里允许任意对象
      base = z.any()
    }
    
    if (f.kind === 'relation') {
      // 关联字段可以是单个ID或ID数组
      base = z.union([z.string(), z.array(z.string())])
    }
    
    if (f.kind === 'lookup') {
      // 查找字段可以是字符串或对象
      base = z.union([z.string(), z.object({
        code: z.string(),
        name: z.string(),
        source: z.string().optional()
      })])
    }
    
    shape[f.key] = f.required ? base : base.optional()
  }
  
  return z.object(shape)
}
