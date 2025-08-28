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
          (f.preset && ["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "constellation", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(f.preset)),
      ),
    [dir.fields],
  )

  const relationFields = useMemo(
    () =>
      dir.fields.filter(
        (f) =>
          f.enabled &&
          (f.type === "relation_many" || f.type === "relation_one") &&
          (!f.preset || !["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "constellation", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(f.preset)),
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
      if (!field.required) continue
      
      const value = formData[field.key]
      const isEmpty = 
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "object" && Object.keys(value).length === 0)
      
      if (field.type === "number" || field.type === "percent") {
        if (value === null || value === undefined || Number.isNaN(Number(value))) {
          return { ok: false, firstMissing: field.label || field.key }
        }
      } else if (field.type === "boolean" || field.type === "checkbox") {
        // booleans are always valid as required
      } else if (isEmpty) {
        return { ok: false, firstMissing: field.label || field.key }
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
      toast({
        description: locale === "zh" ? "保存成功" : "Saved successfully",
      })
    } catch (error) {
      console.error("保存记录失败:", error)
      toast({
        description: locale === "zh" 
          ? `保存失败: ${error instanceof Error ? error.message : "未知错误"}` 
          : `Save failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SheetContent
      side="right"
      className="w-[min(958px,100vw)] max-w-[100vw] p-0 bg-white border-l border-gray-200 flex flex-col !w-[min(958px,100vw)] !max-w-[100vw]"
    >
      <SheetTitle className="sr-only">{title || "Record Details"}</SheetTitle>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center font-medium text-sm text-white shadow-sm">
              {String(title || "NA")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {String((rec as any).category || "") && (
                <span className="text-sm text-gray-500">{t("category")}：{String((rec as any).category)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-600"
                  onClick={() => {
                    setIsEditing(false)
                    // 重置表单数据到原始状态
                    const { id, directoryId, version, createdAt, updatedAt, createdBy, updatedBy, ...props } = rec
                    setFormData(props)
                  }}
                >
                  {locale === "zh" ? "取消" : "Cancel"}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "保存" : "Save")}
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-600"
                onClick={() => setIsEditing(true)}
              >
                {locale === "zh" ? "编辑" : "Edit"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-4">
          <TabsList className="bg-gray-50 rounded-lg p-1">
            <TabsTrigger
              value="basic"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
            >
              {t("basicInfo")}
            </TabsTrigger>
            {relationFields.map((f) => (
              <TabsTrigger
                key={f.id}
                value={f.id}
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
              >
                {f.label}
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="dynamics"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
            >
              {t("dynamicRecord")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto bg-white min-h-0">
          <TabsContent value="basic" className="p-6 mt-0 flex-none">
            <form
              id="record-form"
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
            >
              {(() => {
                // 将字段分为单排和双排布局
                const singleRowFields = basicFields.filter(f => 
                  f.type === "textarea" || 
                  f.type === "rich_text" || 
                  f.type === "markdown" ||
                  f.type === "json" ||
                  f.type === "experience" ||
                  f.type === "identity_verification" ||
                  f.type === "other_verification"
                )
                const doubleRowFields = basicFields.filter(f => 
                  !singleRowFields.includes(f)
                )
                
                return (
                  <>
                    {/* 双排布局字段 */}
                    <div className="grid grid-cols-2 gap-6">
                      {doubleRowFields.map((field) => (
                        <FormField
                          key={field.id}
                          field={field}
                          record={{ ...rec, ...formData }}
                          app={app}
                          onChange={(value) => updateField(field.key, value)}
                          showValidation={isEditing}
                        />
                      ))}
                    </div>
                    
                    {/* 单排布局字段 */}
                    {singleRowFields.map((field) => (
                      <FormField
                        key={field.id}
                        field={field}
                        record={{ ...rec, ...formData }}
                        app={app}
                        onChange={(value) => updateField(field.key, value)}
                        showValidation={isEditing}
                      />
                    ))}
                  </>
                )
              })()}
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


    </SheetContent>
  )
}
