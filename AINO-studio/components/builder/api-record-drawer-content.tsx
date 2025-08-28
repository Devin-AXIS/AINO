"use client"

import type React from "react"

import { useMemo, useState, useEffect } from "react"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { FormField } from "@/components/form-field"
import { RelationManyTab } from "@/components/relation-tabs/relation-many-tab"
import { RelationOneTab } from "@/components/relation-tabs/relation-one-tab"
import { DynamicRecords } from "./dynamic-records"
import { useLocale } from "@/hooks/use-locale"
import { getSkillById } from "@/lib/data/skills-data"

interface DirectoryModel {
  id: string
  name: string
  fields: any[]
  categories?: any[]
}

interface RecordData {
  id: string
  [key: string]: any
}

interface Props {
  dir: DirectoryModel
  rec: RecordData
  app?: any // 应用对象，可选
  onClose: () => void
  onSave: (dirId: string, recordId: string, props: Record<string, any>) => Promise<void>
}

export function ApiRecordDrawerContent({ dir, rec, app, onClose, onSave }: Props) {
  const { toast } = useToast()
  const { t, locale } = useLocale()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // 从记录中提取属性数据（排除元数据字段）
    const { id, directoryId, version, createdAt, updatedAt, createdBy, updatedBy, ...props } = rec
    console.log('🔍 初始化表单数据:', { rec, props })
    return props
  })

  // 监听记录数据变化，更新表单数据
  useEffect(() => {
    const { id, directoryId, version, createdAt, updatedAt, createdBy, updatedBy, ...props } = rec
    console.log('🔍 记录数据变化，更新表单数据:', { rec, props })
    setFormData(props)
  }, [rec])

  const nameField = dir.fields.find(f => f.key === "name" || f.key === "title")
  const title = nameField ? formData[nameField.key] || "(未命名)" : "(未命名)"

  const basicFields = useMemo(
    () =>
      dir.fields.filter(
        (f) =>
          (f.enabled && f.type !== "relation_many" && f.type !== "relation_one") ||
          (f.preset && ["constellation", "skills"].includes(f.preset)),
      ),
    [dir.fields],
  )

  const relationFields = useMemo(
    () =>
      dir.fields.filter(
        (f) =>
          f.enabled &&
          (f.type === "relation_many" || f.type === "relation_one") &&
          (!f.preset || !["constellation", "skills"].includes(f.preset)),
      ),
    [dir.fields],
  )

  const [activeTab, setActiveTab] = useState("basic")

  function updateField(key: string, value: any) {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
    setIsEditing(true)
  }

  function validateRequired(): { ok: boolean; firstMissing?: string } {
    for (const field of basicFields) {
      if (field.required && !formData[field.key]) {
        return { ok: false, firstMissing: field.key }
      }
    }
    return { ok: true }
  }

  async function handleSave() {
    const validation = validateRequired()
    if (!validation.ok) {
      toast({
        description: locale === "zh" 
          ? `请填写必填字段: ${validation.firstMissing}` 
          : `Please fill required field: ${validation.firstMissing}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      await onSave(dir.id, rec.id, formData)
      setIsEditing(false)
    } catch (error) {
      // 错误已在onSave中处理
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col p-0 gap-0">
      <SheetHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <SheetTitle className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </SheetTitle>
      </SheetHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 py-3 border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-auto">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {t("basicInfo")}
            </TabsTrigger>
            
            {relationFields.map((field) => (
              <TabsTrigger key={field.id} value={field.id} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {field.label}
              </TabsTrigger>
            ))}

            <TabsTrigger value="dynamics" className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {t("dynamicRecord")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="basic" className="p-6 mt-0 flex-none h-full overflow-y-auto">
            <form
              id="record-form"
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
            >
              {basicFields.map((field) => (
                <FormField
                  key={field.id}
                  field={field}
                  record={{ ...rec, ...formData }}
                  app={app}
                  onChange={(value) => updateField(field.key, value)}
                />
              ))}
            </form>
          </TabsContent>

          <TabsContent value="dynamics" className="p-6 mt-0 flex-none">
            <DynamicRecords recordId={rec.id} />
          </TabsContent>

          {relationFields.map((field) => (
            <TabsContent key={field.id} value={field.id} className="p-6 mt-0 flex-none">
              {field.type === "relation_many" ? (
                <RelationManyTab
                  app={null} // TODO: 需要适配API版本
                  field={field}
                  rec={rec}
                  onChange={(newIds) => updateField(field.key, newIds)}
                />
              ) : (
                <RelationOneTab
                  app={null} // TODO: 需要适配API版本
                  field={field}
                  rec={rec}
                  onChange={(newId) => updateField(field.key, newId)}
                />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {isEditing && (
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-end">
          <Button 
            type="submit" 
            form="record-form" 
            disabled={isSaving}
            className="rounded-lg px-6 bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isSaving ? (locale === "zh" ? "保存中..." : "Saving...") : t("saveChanges")}
          </Button>
        </div>
      )}
    </SheetContent>
  )
}
