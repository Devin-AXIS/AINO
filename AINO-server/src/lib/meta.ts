import { db } from "../db"
import { directoryDefs, fieldDefs } from "../db/schema"
import { eq } from "drizzle-orm"

export type FieldDef = {
  id: string
  key: string
  kind: 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
  type: string
  schema?: any
  relation?: any
  lookup?: any
  computed?: any
  readRoles?: string[]
  writeRoles?: string[]
  required?: boolean
}

export async function getDirectoryMeta(slug: string) {
  const dir = await db.query.directoryDefs.findFirst({ 
    where: eq(directoryDefs.slug, slug) 
  })
  if (!dir) throw new Error(`directory ${slug} not found`)
  
  const fields = await db.query.fieldDefs.findMany({ 
    where: eq(fieldDefs.directoryId, dir.id) 
  })
  
  return { 
    dir, 
    fields: fields as unknown as FieldDef[] 
  }
}
