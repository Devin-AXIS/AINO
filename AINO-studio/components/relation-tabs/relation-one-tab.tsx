"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelationChooserDialog } from "@/components/dialogs/relation-chooser-dialog"
import type { AppModel, FieldModel, RecordRow } from "@/lib/store"
import { findDirByIdAcrossModules, getRecordName } from "@/lib/store"

export function RelationOneTab({
  app,
  field,
  rec,
  onChange,
}: {
  app: AppModel
  field: FieldModel
  rec: RecordRow
  onChange: (newId: string | null) => void
}) {
  const targetDirId = field.relation?.targetDirId
  const targetDir = findDirByIdAcrossModules(app, targetDirId)
  const selectedId = (rec as any)[field.key] || null
  const selectedRecord = selectedId && targetDir ? targetDir.records.find((r) => r.id === selectedId) : null

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSaveFromDialog = (newIdSet: Set<string>) => {
    onChange(Array.from(newIdSet)[0] || null)
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {selectedRecord ? (
          <div
            key={selectedRecord.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <span className="font-medium">{getRecordName(targetDir!, selectedRecord)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onChange(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-xl">
            暂无关联记录
          </div>
        )}
      </div>
      <Button variant="outline" className="w-full bg-white" onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 size-4" />
        {selectedRecord ? "更换" : "选择"}表
      </Button>
      {targetDir && (
        <RelationChooserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          targetDir={targetDir}
          isMulti={false}
          selectedIds={selectedId ? new Set([selectedId]) : new Set()}
          onSave={handleSaveFromDialog}
        />
      )}
    </div>
  )
}
