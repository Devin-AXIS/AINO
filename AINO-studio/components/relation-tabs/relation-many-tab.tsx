"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelationChooserDialog } from "@/components/dialogs/relation-chooser-dialog"
import type { AppModel, FieldModel, RecordRow } from "@/lib/store"
import { findDirByIdAcrossModules, getRecordName } from "@/lib/store"
import { useLocale } from "@/hooks/use-locale"

export function RelationManyTab({
  app,
  field,
  rec,
  onChange,
}: {
  app: AppModel
  field: FieldModel
  rec: RecordRow
  onChange: (newIds: string[]) => void
}) {
  const { locale } = useLocale()
  const targetDirId = field.relation?.targetDirId
  const targetDir = findDirByIdAcrossModules(app, targetDirId)
  const rawValue = (rec as any)[field.key]
  const selectedIds = Array.isArray(rawValue) ? rawValue : []
  const selectedRecords = selectedIds.map((id: string) => targetDir?.records.find((r) => r.id === id)).filter(Boolean)

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleRemove = (idToRemove: string) => {
    onChange(selectedIds.filter((id: string) => id !== idToRemove))
  }

  const handleSaveFromDialog = (newIdSet: Set<string>) => {
    onChange(Array.from(newIdSet))
    setDialogOpen(false)
  }

  const getCoreFields = () => {
    if (!targetDir) return []
    return targetDir.fields.filter((f) => f.enabled).slice(0, 4)
  }

  const coreFields = getCoreFields()

  const renderCell = (type: string, v: any, f?: any) => {
    const valueStr = String(v ?? "")

    if (type === "tags" && Array.isArray(v) && v.length > 0) {
      const visibleTags = v.slice(0, 2)
      const hiddenCount = v.length - visibleTags.length
      return (
        <div className="flex flex-wrap gap-1 items-center" title={v.join(", ")}>
          {visibleTags.map((x: string, i: number) => (
            <span
              key={i}
              className="text-xs px-1.5 py-0.5 rounded-full border border-white/60 bg-white/70 backdrop-blur shadow-sm"
            >
              {x}
            </span>
          ))}
          {hiddenCount > 0 && <span className="text-xs text-muted-foreground ml-1">+{hiddenCount}</span>}
        </div>
      )
    }

    if (type === "select" && String(v ?? "") === "上架") {
      return <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{v}</span>
    }

    if (type === "boolean" || type === "checkbox") {
      const label = v ? f?.trueLabel || "是" : f?.falseLabel || "否"
      return (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            v ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
          }`}
        >
          {label}
        </span>
      )
    }

    if (type === "date" || type === "time") {
      return (
        <div className="truncate" title={valueStr}>
          {valueStr}
        </div>
      )
    }

    if (type === "image" && v) {
      return (
        <img
          src={typeof v === "string" ? v : "/placeholder.svg?height=32&width=48&query=image-preview"}
          alt="封面"
          className="h-8 w-12 object-cover rounded border border-white/60"
          crossOrigin="anonymous"
        />
      )
    }

    if (type === "file") {
      return v ? (
        <div className="text-xs truncate" title={valueStr}>
          {valueStr}
        </div>
      ) : (
        ""
      )
    }

    if (type === "percent") {
      const n = Number(v ?? 0)
      return (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
          {Number.isFinite(n) ? `${n}%` : ""}
        </span>
      )
    }

    return (
      <div className="truncate" title={valueStr}>
        {valueStr}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">{locale === "zh" ? "显示连标一些核心资料 最多不超过4" : "Display linked core data, up to 4 items"}</div>
      
      {selectedRecords.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 min-w-max">
            <thead>
              <tr>
                {coreFields.map((f) => (
                  <th
                    key={f.id}
                    className="text-left text-xs font-medium bg-white/60 backdrop-blur py-2 px-4 border border-white/60 first:rounded-l-xl last:rounded-r-xl whitespace-nowrap min-w-[120px]"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="text-left text-xs font-medium bg-white/60 backdrop-blur py-2 px-4 border border-white/60 rounded-xl sticky right-0 z-10 min-w-[120px]">
                  {locale === "zh" ? "操作" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedRecords.map((record) => (
                <tr key={record.id} className="group">
                  {coreFields.map((f) => {
                    const v = (record as any)[f.key]
                    return (
                      <td
                        key={f.id}
                        className="bg-white/60 backdrop-blur border border-white/60 py-2 px-4 first:rounded-l-xl last:rounded-r-xl align-top text-sm whitespace-nowrap min-w-[120px]"
                      >
                        {renderCell(f.type, v, f)}
                      </td>
                    )
                  })}
                  <td className="bg-white/60 backdrop-blur border border-white/60 py-2 px-4 rounded-xl sticky right-0 z-10 align-top min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <Button variant="destructive" size="sm" onClick={() => handleRemove(record.id)}>
                        {locale === "zh" ? "删除" : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-xl">
          {locale === "zh" ? "暂无关联记录" : "No related records"}
        </div>
      )}
      <Button variant="outline" className="w-full bg-white" onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 size-4" />
        {locale === "zh" ? "添加表" : "Add Record"}
      </Button>
      {targetDir && (
        <RelationChooserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          targetDir={targetDir}
          isMulti={true}
          selectedIds={new Set(selectedIds)}
          onSave={handleSaveFromDialog}
        />
      )}
    </div>
  )
}
