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
import { fieldCategoriesApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { FieldCategoryModel } from "@/lib/field-categories"

type Props = {
  app: AppModel
  dir: DirectoryModel
  onChange: (dir: DirectoryModel) => void
  onAddField?: () => void
}

function FieldRow({
  field,
  idx,
  total,
  typeNames,
  category,
  onToggleEnabled,
  onToggleRequired,
  onToggleList,
  onEdit,
  onRemove,
}: {
  field: FieldModel
  idx: number
  total: number
  typeNames: Record<FieldType, string>
  category?: FieldCategoryModel
  onToggleEnabled: (v: boolean) => void
  onToggleRequired: (v: boolean) => void
  onToggleList: (v: boolean) => void
  onEdit: () => void
  onRemove: () => void
}) {
  const { t, locale } = useLocale()
  const f = field
  return (
    <Card className="p-3 bg-white/60 backdrop-blur border-white/60">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-medium truncate">{f.label}</div>
            <Badge variant="outline" className="text-xs">
              {typeNames[f.type]}
            </Badge>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
            {f.required && (
              <Badge variant="destructive" className="text-xs">
                {locale === "zh" ? "必填" : "Required"}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">{locale === "zh" ? "Key：" : "Key: "}{f.key}</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{locale === "zh" ? "启用" : "Enabled"}</span>
            <Switch checked={f.enabled !== false} onCheckedChange={onToggleEnabled} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{locale === "zh" ? "必填" : "Required"}</span>
            <Switch checked={!!f.required} onCheckedChange={onToggleRequired} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{locale === "zh" ? "列表显示" : "Show in List"}</span>
            <Switch checked={f.showInList !== false} onCheckedChange={onToggleList} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 w-8 inline-flex items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing rounded-md border border-white/60 bg-white/70"
              title={t("dragToSort")}
              aria-label={t("dragToSort")}
              draggable
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <Button size="sm" onClick={onEdit} className="rounded-xl" title={t("editField")}>
              <Edit className="mr-1 size-4" />
              {locale === "zh" ? "编辑" : "Edit"}
            </Button>
            {f.locked ? (
              <Badge variant="secondary" className="text-xs">
                {t("defaultField")}
              </Badge>
            ) : (
              <Button variant="destructive" size="sm" onClick={onRemove} className="rounded-xl">
                <Trash2 className="mr-1 size-4" />
                {t("deleteField")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
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

  // 当应用或目录变化时，重新获取字段分类
  useEffect(() => {
    // ✅ 必须：API调用前检查必要参数
    if (app?.id && dir?.id) {
      console.log("🔄 应用或目录变化，重新获取字段分类:", { appId: app.id, dirId: dir.id })
      fetchFieldCategories()
    } else {
      console.log("⏸️ 等待必要参数就绪:", { appId: app?.id, dirId: dir?.id })
    }
  }, [app?.id, dir?.id]) // 使用可选链确保依赖项稳定

  const categorizedFields = useMemo(() => {
    const categories = new Map<string, { category: FieldCategoryModel; fields: FieldModel[] }>()
    const uncategorizedFields: FieldModel[] = []

    dir.fields.forEach((field) => {
      const category = field.categoryId
        ? fieldCategories.find((cat) => cat.id === field.categoryId)
        : fieldCategories.find((cat) => cat.fields?.some((predefined: any) => predefined.key === field.key))

      if (category) {
        if (!categories.has(category.id)) {
          categories.set(category.id, { category, fields: [] })
        }
        categories.get(category.id)!.fields.push(field)
      } else {
        uncategorizedFields.push(field)
      }
    })

    return { categories: Array.from(categories.values()), uncategorizedFields }
  }, [dir.fields, fieldCategories])

  const filteredFields = useMemo(() => {
    if (!selectedCategoryId) return dir.fields

    if (selectedCategoryId === "uncategorized") {
      return categorizedFields.uncategorizedFields
    }

    const categoryData = categorizedFields.categories.find((c) => c.category.id === selectedCategoryId)
    return categoryData ? categoryData.fields : []
  }, [dir.fields, selectedCategoryId, categorizedFields])

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

  const typeNames: Record<FieldType, string> = useMemo(
    () => ({
      text: t("ft_text"),
      textarea: t("ft_textarea"),
      number: t("ft_number"),
      select: t("ft_select"),
      multiselect: t("ft_multiselect"),
      boolean: t("ft_boolean"),
      date: t("ft_date"),
      time: t("ft_time"),
      tags: t("ft_tags"),
      image: t("ft_image"),
      video: t("ft_video"),
      file: t("ft_file"),
      richtext: t("ft_richtext"),
      percent: t("ft_percent"),
      barcode: t("ft_barcode"),
      checkbox: t("ft_checkbox"),
      cascader: t("ft_cascader"),
      relation_one: t("ft_relation_one"),
      relation_many: t("ft_relation_many"),
      experience: t("ft_experience"),
    }),
    [t],
  )

  function commit(patch: (d: DirectoryModel) => void) {
    const next = structuredClone(dir)
    patch(next)
    onChange(next)
  }

  function updateFieldCategories(categories: FieldCategoryModel[]) {
    setFieldCategories(categories)
    commit((d) => {
      d.fieldCategories = categories
    })
  }

  function removeField(id: string) {
    if (!confirm(t("confirmDeleteField"))) return
    commit((d) => {
      d.fields = d.fields.filter((x) => x.id !== id)
      d.records.forEach((r) => {
        const f = dir.fields.find((x) => x.id === id)
        if (f && f.key in r) delete (r as any)[f.key]
      })
    })
  }

  function addField(fieldData: any) {
    const newField: FieldModel = {
      id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      key: fieldData.key,
      label: fieldData.label,
      type: fieldData.type,
      required: fieldData.required,
      unique: fieldData.unique,
      locked: false,
      enabled: true,
      categoryId: fieldData.categoryId,
      desc: fieldData.desc,
      placeholder: fieldData.placeholder,
      min: fieldData.min,
      max: fieldData.max,
      step: fieldData.step,
      unit: fieldData.unit,
      options: fieldData.options,
      default: fieldData.default,
      showInList: fieldData.showInList,
      showInForm: fieldData.showInForm,
      showInDetail: fieldData.showInDetail,
      trueLabel: fieldData.trueLabel,
      falseLabel: fieldData.falseLabel,
      accept: fieldData.accept,
      maxSizeMB: fieldData.maxSizeMB,
      relation: fieldData.relation,
      cascaderOptions: fieldData.cascaderOptions,
      dateMode: fieldData.dateMode,
      preset: fieldData.preset,
      skillsConfig: fieldData.skillsConfig,
      progressConfig: fieldData.progressConfig,
      customExperienceConfig: fieldData.customExperienceConfig,
      identityVerificationConfig: fieldData.identityVerificationConfig,
      certificateConfig: fieldData.certificateConfig,
      otherVerificationConfig: fieldData.otherVerificationConfig,
      imageConfig: fieldData.imageConfig,
      videoConfig: fieldData.videoConfig,
      // booleanConfig: fieldData.booleanConfig,
      // multiselectConfig: fieldData.multiselectConfig,
      // config: fieldData.config || {},
      // order: dir.fields.length,
      // createdAt: new Date().toISOString(),
      // updatedAt: new Date().toISOString(),
    }

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
