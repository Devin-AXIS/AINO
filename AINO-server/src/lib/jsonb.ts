import { sql } from "drizzle-orm"

export function jsonEq(col: any, key: string, val: any) {
  return sql`(${col} ->> ${key}) = ${val}`
}

export function jsonNum(col: any, key: string) {
  return sql`((${col} ->> ${key})::numeric)`
}

export function buildOrderBy(col: any, sort?: string) {
  if (!sort) return [] as any[]
  return sort.split(',').map((p) => {
    const [k, dir = 'asc'] = p.split(':')
    if (k.startsWith('props.')) {
      const key = k.replace('props.', '')
      return sql`${jsonNum(col, key)} ${sql.raw(dir.toUpperCase())}`
    }
    return sql`${sql.identifier(k)} ${sql.raw(dir.toUpperCase())}`
  })
}

export function projectProps(props: Record<string, any>, fields?: string) {
  if (!fields) return props
  const allow = new Set(fields.split(',').map((s) => s.trim()).filter(Boolean))
  const out: Record<string, any> = {}
  for (const k of allow) if (props[k] !== undefined) out[k] = props[k]
  return out
}
