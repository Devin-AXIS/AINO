"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, GripVertical, Settings, Plus } from "lucide-react"
import type { AppModel, DirectoryModel, FieldModel, FieldType } from "@/lib/store"
import { useLocale } from "@/hooks/use-locale"
import { FieldEditor } from "@/components/dialogs/field-editor"
import { FieldCategoryManager } from "@/components/dialogs/field-category-manager"
import { AddFieldDialog } from "@/components/dialogs/add-field-dialog"
import { FieldRow } from "@/components/field-manager/field-row"
import { fieldCategoriesApi, fieldsApi } from "@/lib/api"
import { getFieldTypeNames } from "@/lib/field-types"
import { 
  categorizeFields, 
  filterFieldsByCategory, 
  createField, 
  removeFieldFromDirectory, 
  updateFieldCategoriesInDirectory 
} from "@/lib/field-operations"
import { cn } from "@/lib/utils"
import type { FieldCategoryModel } from "@/lib/field-categories"

type Props = {
  app: AppModel
  dir: DirectoryModel
  onChange: (dir: DirectoryModel) => void
  onAddField?: () => void
}



export function FieldManager({ app, dir, onChange, onAddField }: Props) {
  const { t, locale } = useLocale()
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<FieldModel | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [fieldCategories, setFieldCategories] = useState<FieldCategoryModel[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fieldDefs, setFieldDefs] = useState<any[]>([])
  const [fieldDefsLoading, setFieldDefsLoading] = useState(false)

  // 从API获取字段分类数据
  const fetchFieldCategories = async () => {
    // ✅ 必须：API调用前检查必要参数
    if (!app?.id || !dir?.id) {
      console.warn("⚠️ 缺少必要参数，跳过字段分类获取:", { appId: app?.id, dirId: dir?.id })
      setFieldCategories([])
      return
    }

    try {
      setLoading(true)
      console.log("🔍 获取字段分类参数:", { appId: app.id, dirId: dir.id })
      
      const response = await fieldCategoriesApi.getFieldCategories({
        applicationId: app.id,
        directoryId: dir.id,
        enabled: true,
      })
      
      console.log("📡 字段分类API响应:", response)
      
      if (response.success && response.data?.categories) {
        setFieldCategories(response.data.categories)
      } else {
        console.error("获取字段分类失败:", response.error)
        setFieldCategories([])
      }
    } catch (error) {
      // ✅ 必须：为所有API调用添加try-catch错误处理
      console.error("获取字段分类出错:", error)
      
      // ✅ 必须：错误信息要用户友好
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          console.warn("🌐 网络连接问题，使用默认字段分类")
        } else {
          console.error("❌ API调用失败:", error.message)
        }
      }
      
      // ✅ 必须：错误恢复机制 - 使用默认数据而不是空数组
      setFieldCategories([])
    } finally {
      setLoading(false)
    }
  }

  // 从API获取字段定义数据
  const fetchFieldDefs = async () => {
    // ✅ 必须：API调用前检查必要参数
    if (!dir?.id) {
      console.warn("⚠️ 缺少必要参数，跳过字段定义获取:", { dirId: dir?.id })
      setFieldDefs([])
      return
    }

    try {
      setFieldDefsLoading(true)
      console.log("🔍 获取字段定义参数:", { directoryId: dir.id })
      
      const response = await fieldsApi.getFields({
        directoryId: dir.id,
        page: 1,
        limit: 100, // 获取所有字段定义
      })
      
      console.log("📡 字段定义API响应:", response)
      
      if (response.success && response.data?.data) {
        setFieldDefs(response.data.data)
      } else {
        console.error("获取字段定义失败:", response.error)
        setFieldDefs([])
      }
    } catch (error) {
      // ✅ 必须：为所有API调用添加try-catch错误处理
      console.error("获取字段定义出错:", error)
      
      // ✅ 必须：错误信息要用户友好
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          console.warn("🌐 网络连接问题，使用默认字段定义")
        } else {
          console.error("❌ API调用失败:", error.message)
        }
      }
      
      // ✅ 必须：错误恢复机制 - 使用默认数据而不是空数组
      setFieldDefs([])
    } finally {
      setFieldDefsLoading(false)
    }
  }

  // 当应用或目录变化时，重新获取字段分类和字段定义
  useEffect(() => {
    // ✅ 必须：API调用前检查必要参数
    if (app?.id && dir?.id) {
      console.log("🔄 应用或目录变化，重新获取数据:", { appId: app.id, dirId: dir.id })
      fetchFieldCategories()
      fetchFieldDefs()
    } else {
      console.log("⏸️ 等待必要参数就绪:", { appId: app?.id, dirId: dir?.id })
    }
  }, [app?.id, dir?.id]) // 使用可选链确保依赖项稳定

  const categorizedFields = useMemo(() => 
    categorizeFields(dir.fields, fieldCategories), 
    [dir.fields, fieldCategories]
  )

  const filteredFields = useMemo(() => 
    filterFieldsByCategory(dir.fields, selectedCategoryId, categorizedFields), 
    [dir.fields, selectedCategoryId, categorizedFields]
  )

  function handleDragStart(i: number) {
    setDragIndex(i)
  }
  function handleDragEnter(i: number) {
    setDragIndex((from) => {
      if (from === null || from === i) return from
      commit((d) => {
        const [moved] = d.fields.splice(from, 1)
        d.fields.splice(i, 0, moved)
      })
      return i
    })
  }
  function handleDragEnd() {
    setDragIndex(null)
  }

  const typeNames = useMemo(() => getFieldTypeNames(t), [t])

  function commit(patch: (d: DirectoryModel) => void) {
    const next = structuredClone(dir)
    patch(next)
    onChange(next)
  }

  function updateFieldCategories(categories: FieldCategoryModel[]) {
    setFieldCategories(categories)
    const updatedDir = updateFieldCategoriesInDirectory(dir, categories)
    onChange(updatedDir)
  }

  function removeField(id: string) {
    if (!confirm(t("confirmDeleteField"))) return
    const updatedDir = removeFieldFromDirectory(dir, id)
    onChange(updatedDir)
  }

  function addField(fieldData: any) {
    const newField = createField(fieldData)

    commit((d) => {
      d.fields.push(newField)
    })
  }

  const i18n = useMemo(
    () =>
      locale === "zh"
        ? {
            title: "添加字段",
            displayName: "显示名",
            displayNamePh: "如：商品名",
            key: "内部名（唯一）",
            keyPh: "如：product_name",
            keyInvalid: "需以字母或下划线开头，仅含字母数字下划线，≤40字符",
            keyDuplicate: "内部名已存在",
            dataType: "数据类型",
            required: "必填",
            requiredHint: "表单校验时要求必填",
            unique: "唯一",
            uniqueHint: "该字段值不可重复",
            showInList: "显示在列表",
            showInListHint: "控制列表是否展示",
            default: "默认值",
            none: "无",
            true: "是",
            false: "否",
            optionLabel: "选项",
            optionPlaceholder: "选项",
            addOption: "添加选项",
            optionsHint: "提示：默认值会根据当前选项生成；修改选项后请重新确认默认值。",
            relationTarget: "关联目标表",
            cancel: "取消",
            submit: "添加字段",
            dateModeLabel: "日期模式",
            dateModeSingle: "单个日期",
            dateModeMultiple: "多个日期",
            dateModeRange: "日期区间",
            basicFieldsLabel: t("basicFields"),
            businessFieldsLabel: t("businessFields"),
          }
        : {
            title: "Add Field",
            displayName: "Label",
            displayNamePh: "e.g. Product Name",
            key: "Key (unique)",
            keyPh: "e.g. product_name",
            keyInvalid: "Must start with a letter/underscore, only letters/digits/underscore, ≤ 40 chars",
            keyDuplicate: "Key already exists",
            dataType: "Data Type",
            required: "Required",
            requiredHint: "Enforce required in forms",
            unique: "Unique",
            uniqueHint: "Value cannot be duplicated",
            showInList: "Show in List",
            showInListHint: "Control visibility in list",
            default: "Default",
            none: "None",
            true: "True",
            false: "False",
            optionLabel: "Options",
            optionPlaceholder: "Option",
            addOption: "Add option",
            optionsHint: "Tip: default value depends on options; re-verify after changes.",
            relationTarget: "Relation Target Table",
            cancel: "Cancel",
            submit: "Add Field",
            dateModeLabel: "Date Mode",
            dateModeSingle: "Single",
            dateModeMultiple: "Multiple",
            dateModeRange: "Range",
            basicFieldsLabel: t("basicFields"),
            businessFieldsLabel: t("businessFields"),
          },
    [locale, t],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{t("fieldManagement")}</div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddFieldOpen(true)} className="rounded-xl">
            <Plus className="mr-1 size-4" />
            {locale === "zh" ? "添加字段" : "Add Field"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCategoryManagerOpen(true)} className="rounded-xl">
            <Settings className="mr-1 size-4" />
            {t("categoryManagement")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategoryId(null)}
          className="rounded-xl whitespace-nowrap flex-shrink-0"
        >
          {t("allFields")} ({dir.fields.length})
        </Button>
        {fieldCategories
          .filter((category) => category.enabled)
          .map((category) => {
            const categoryData = categorizedFields.categories.find((c) => c.category.id === category.id)
            const fieldCount = categoryData ? categoryData.fields.length : 0
            return (
              <Button
                key={`category-${category.id}`}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(category.id)}
                className="rounded-xl whitespace-nowrap flex-shrink-0"
              >
                {category.name} ({fieldCount})
              </Button>
            )
          })}
        {categorizedFields.uncategorizedFields.length > 0 && (
          <Button
            variant={selectedCategoryId === "uncategorized" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryId("uncategorized")}
            className="rounded-xl whitespace-nowrap flex-shrink-0"
          >
            {t("uncategorized")} ({categorizedFields.uncategorizedFields.length})
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {filteredFields.map((f, idx) => {
          const category = f.categoryId
            ? fieldCategories.find((cat) => cat.id === f.categoryId)
            : fieldCategories.find((cat) => cat.fields?.some((predefined: any) => predefined.key === f.key))

          return (
            <div
              key={`field-${f.id}-${idx}`}
              className={"rounded-xl " + (dragIndex === idx ? "ring-2 ring-blue-200" : "")}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
            >
              <FieldRow
                field={f}
                idx={idx}
                total={filteredFields.length}
                typeNames={typeNames}
                category={category}
                onToggleEnabled={(v) =>
                  commit((d) => {
                    const ff = d.fields.find((x) => x.id === f.id)!
                    ff.enabled = v
                  })
                }
                onToggleRequired={(v) =>
                  commit((d) => {
                    const ff = d.fields.find((x) => x.id === f.id)!
                    ff.required = v
                  })
                }
                onToggleList={(v) =>
                  commit((d) => {
                    const ff = d.fields.find((x) => x.id === f.id)!
                    ff.showInList = v
                  })
                }
                onEdit={() => {
                  setEditing(f)
                  setEditOpen(true)
                }}
                onRemove={() => removeField(f.id)}
              />
            </div>
          )
        })}
        {filteredFields.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-8">
            {selectedCategoryId ? (locale === "zh" ? "该分类暂无字段" : "No fields in this category") : (locale === "zh" ? "暂无字段" : "No fields")}
          </div>
        )}
      </div>

      {editing && (
        <FieldEditor
          open={editOpen}
          onOpenChange={setEditOpen}
          app={app}
          dir={dir}
          field={editing}
          typeNames={typeNames}
          i18n={i18n}
          onSubmit={(nextDir) => {
            onChange(nextDir)
          }}
        />
      )}

      <AddFieldDialog
        open={addFieldOpen}
        onOpenChange={setAddFieldOpen}
        app={app}
        currentDir={dir}
        typeNames={typeNames}
        onSubmit={(fieldData) => {
          addField(fieldData)
          setAddFieldOpen(false)
        }}
        i18n={i18n}
      />

      <FieldCategoryManager
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        categories={fieldCategories}
        onCategoriesChange={updateFieldCategories}
        applicationId={app.id}
        directoryId={dir.id}
        onFieldAdded={() => {
          // 当字段被添加时，刷新字段列表
          fetchFieldCategories()
        }}
      />
    </div>
  )
}
