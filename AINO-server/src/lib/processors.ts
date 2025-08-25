import type { FieldDef } from './meta'

type Ctx = { tenantId: string, now: Date }

export const processors = {
  primitive: {
    async serialize(v: any, f: FieldDef, _ctx: Ctx) { 
      return v 
    },
    async deserialize(v: any) { 
      return v 
    },
  },
  composite: {
    async serialize(v: any, f: FieldDef, _ctx: Ctx) {
      // TODO: 按 f.schema 做更严格的结构校验/标准化
      return v
    },
    async deserialize(v: any) { 
      return v 
    },
  },
  relation: {
    async serialize(v: any, f: FieldDef, _ctx: Ctx) {
      // 允许传单个ID/URN或数组，统一为数组形式存储
      const arr = Array.isArray(v) ? v : [v]
      // TODO: 可选：校验 ID/URN 格式/存在性（异步队列）
      return arr
    },
    async deserialize(v: any) { 
      return v 
    },
  },
  lookup: {
    async serialize(v: any, f: FieldDef, _ctx: Ctx) {
      console.log('Lookup processor - input:', v, 'field:', f.key)
      // 简版：同步"假装归一化"；生产中接入缓存/第三方API并带 TTL
      if (typeof v === 'string') {
        const result = { 
          code: v, 
          name: v, 
          source: f.lookup?.source || 'manual' 
        }
        console.log('Lookup processor - output:', result)
        return result
      }
      console.log('Lookup processor - returning as-is:', v)
      return v
    },
    async deserialize(v: any) { 
      return v 
    },
  },
  computed: {
    async serialize(_v: any, f: FieldDef, _ctx: Ctx) {
      // writeThrough 模式在写入时计算
      // 示例：按经验数组求总月数（仅演示）
      if (f.computed?.expr === 'sumMonths(experience)') {
        // 这里应读取 input.experience；简化：返回 undefined 由上层忽略
      }
      return _v
    },
    async deserialize(v: any) { 
      return v 
    },
  },
} as const

export async function runSerialize(kind: FieldDef['kind'], value: any, f: FieldDef, ctx: Ctx) {
  const h = (processors as any)[kind]
  if (!h) throw new Error(`unknown processor: ${kind}`)
  return h.serialize(value, f, ctx)
}

export async function runDeserialize(kind: FieldDef['kind'], value: any) {
  const h = (processors as any)[kind]
  if (!h) throw new Error(`unknown processor: ${kind}`)
  return h.deserialize(value)
}
