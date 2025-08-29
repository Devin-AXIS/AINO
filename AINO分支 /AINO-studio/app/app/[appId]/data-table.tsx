"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { AppModel, DirectoryModel } from "@/lib/store"
import { useLocale } from "@/hooks/use-locale"
import { getSkillById } from "@/lib/data/skills-data"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

type Props = {
  app: AppModel
  dir: DirectoryModel
  filters: { kw: string; status: string; category: string }
  onOpen: (recordId: string) => void
  onDelete: (recordId: string) => void
  // Selection controls
  selectable?: boolean
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  // Permission flags for controls in table
  canDelete?: boolean
  pageSize?: number
}

export function DataTable({
  app,
  dir,
  filters,
  onOpen,
  onDelete,
  selectable = false,
  selected = [],
  onSelectedChange,
  canDelete = true,
  pageSize = 10,
}: Props) {
  const { locale } = useLocale()
  const [currentPage, setCurrentPage] = useState(1)

  const enabledFields = useMemo(() => dir.fields.filter((f) => f.enabled && (f.showInList ?? true)), [dir.fields])

  const filteredRows = useMemo(() => {
    const kw = filters.kw.trim().toLowerCase()
    const st = filters.status
    const cat = filters.category
    return dir.records.filter((r) => {
      let ok = true
      if (kw) {
        ok = Object.keys(r).some((k) =>
          String((r as any)[k] ?? "")
            .toLowerCase()
            .includes(kw),
        )
      }
      if (ok && st && st !== "all") ok = String((r as any).status || "") === st
      if (ok && cat && cat !== "all") ok = String((r as any).category || "") === cat
      return ok
    })
  }, [dir.records, filters])

  const totalPages = Math.ceil(filteredRows.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const rows = useMemo(() => filteredRows.slice(startIndex, endIndex), [filteredRows, startIndex, endIndex])

  useMemo(() => {
    setCurrentPage(1)
  }, [filters.kw, filters.status, filters.category])

  const visibleIds = useMemo(() => rows.map((r) => r.id), [rows])
  const allSelectedVisible = selectable && visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id))
  const someSelectedVisible = selectable && visibleIds.some((id) => selected.includes(id)) && !allSelectedVisible

  function toggleAllVisible() {
    if (!selectable || !onSelectedChange) return
    if (allSelectedVisible) {
      // deselect visible
      onSelectedChange(selected.filter((id) => !visibleIds.includes(id)))
    } else {
      // select union of current + visible
      const set = new Set([...selected, ...visibleIds])
      onSelectedChange(Array.from(set))
    }
  }
  function toggleOne(id: string) {
    if (!selectable || !onSelectedChange) return
    if (selected.includes(id)) onSelectedChange(selected.filter((x) => x !== id))
    else onSelectedChange([...selected, id])
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const renderPaginationItems = () => {
    const items = []
    const showEllipsis = totalPages > 7

    if (showEllipsis) {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => goToPage(1)} isActive={currentPage === 1} className="cursor-pointer">
            1
          </PaginationLink>
        </PaginationItem>,
      )

      // Show ellipsis if current page is far from start
      if (currentPage > 4) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => goToPage(i)} isActive={currentPage === i} className="cursor-pointer">
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 3) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => goToPage(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    } else {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => goToPage(i)} isActive={currentPage === i} className="cursor-pointer">
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    }

    return items
  }

  return (
    <div className="space-y-4">
      {filteredRows.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div>
            {locale === "zh" ? `显示第 ${startIndex + 1}-${Math.min(endIndex, filteredRows.length)} 条，共 ${filteredRows.length} 条记录` : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredRows.length)} of ${filteredRows.length} records`}
          </div>
          <div>
            {locale === "zh" ? `第 ${currentPage} 页，共 ${totalPages} 页` : `Page ${currentPage} of ${totalPages}`}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2 min-w-max">
          <thead>
            <tr>
              {selectable && (
                <th className="w-[44px] text-center bg-white/60 backdrop-blur py-2 px-2 border border-white/60 rounded-xl">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={allSelectedVisible ? true : someSelectedVisible ? "indeterminate" : false}
                      onCheckedChange={toggleAllVisible}
                      aria-label="选择所有"
                    />
                  </div>
                </th>
              )}
              {enabledFields.map((f) => (
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
            {rows.map((row, index) => (
              <tr key={row.id || `row-${index}`} className="group">
                {selectable && (
                  <td className="bg-white/60 backdrop-blur border border-white/60 py-2 px-2 rounded-xl align-top">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onCheckedChange={(v) => {
                          // prevent row click
                          toggleOne(row.id)
                        }}
                        aria-label={`选择 ${row.id}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </td>
                )}
                {enabledFields.map((f) => {
                  const v = (row as any)[f.key]
                  return (
                    <td
                      key={f.id}
                      className="bg-white/60 backdrop-blur border border-white/60 py-2 px-4 first:rounded-l-xl last:rounded-r-xl cursor-pointer align-top text-sm whitespace-nowrap min-w-[120px]"
                      onClick={() => onOpen(row.id)}
                    >
                      {renderCell(f.type, v, f, locale)}
                    </td>
                  )
                })}
                <td className="bg-white/60 backdrop-blur border border-white/60 py-2 px-4 rounded-xl sticky right-0 z-10 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => onOpen(row.id)}>
                      {locale === "zh" ? "管理" : "Manage"}
                    </Button>
                    {canDelete && (
                      <Button variant="destructive" size="sm" onClick={() => onDelete(row.id)}>
                        {locale === "zh" ? "删除" : "Delete"}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  className="text-center text-muted-foreground py-10"
                  colSpan={enabledFields.length + 1 + (selectable ? 1 : 0)}
                >
                  {locale === "zh" ? "暂无数据" : "No data"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

function renderCell(type: string, v: any, f?: any, locale?: string) {
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
    return <span className={cn("text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700")}>{v}</span>
  }
  if (type === "boolean" || type === "checkbox") {
    const label = v ? f?.trueLabel || "是" : f?.falseLabel || "否"
    return (
      <span
        className={cn(
          "text-xs px-1.5 py-0.5 rounded-full",
          v ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700",
        )}
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
    // 处理单图/多图模式，加入防御性拆分与裁剪，避免首图为拼接串
    const splitConcat = (s: string): string[] => {
      let str = (s ?? '').replace(/^\ufeff/, '').trim()
      if (!str) return []
      const firstDataIdx = str.indexOf('data:image/')
      if (firstDataIdx > 0) str = str.slice(firstDataIdx)
      if (str.startsWith('[') && str.includes('data:image')) {
        try {
          const arr = JSON.parse(str)
          if (Array.isArray(arr)) {
            return arr
              .map((x) => String(x ?? '').trim())
              .filter((x) => x.startsWith('data:image/') || x.startsWith('http://') || x.startsWith('https://'))
          }
        } catch { }
      }
      const dataMarkers = str.match(/data:image\//g) || []
      if (dataMarkers.length > 1) {
        return str.split(/(?=data:image\/)/).map((x) => x.trim()).filter((x) => x.startsWith('data:image/') || x.startsWith('http://') || x.startsWith('https://'))
      }
      const httpMarkers = str.match(/https?:\/\//g) || []
      if (httpMarkers.length > 1) {
        return str.split(/\s*,\s*/).map((x) => x.trim()).filter((x) => x.startsWith('http://') || x.startsWith('https://') || x.startsWith('data:image/'))
      }
      if (str.startsWith('data:image/')) {
        const pngEnd = 'AAElFTkSuQmCC'
        const jpegEndCandidates = ['/9k=', '/9s=', '/9j/']
        let endIdx = -1
        if (str.includes(pngEnd)) {
          endIdx = str.indexOf(pngEnd) + pngEnd.length
        } else {
          for (const tail of jpegEndCandidates) {
            const i = str.indexOf(tail)
            if (i > -1) { endIdx = Math.max(endIdx, i + tail.length) }
          }
        }
        if (endIdx > -1 && endIdx < str.length) {
          str = str.slice(0, endIdx)
        }
      }
      return (str.startsWith('data:image/') || str.startsWith('http://') || str.startsWith('https://')) ? [str] : []
    }

    const normalizeImages = (val: any): string[] => {
      if (Array.isArray(val)) {
        const result: string[] = []
        for (const item of val) {
          for (const p of splitConcat(String(item ?? ''))) if (p) result.push(p)
        }
        return result
      }
      return splitConcat(String(val ?? ''))
    }

    const images = normalizeImages(v)
    const validImages = images.filter(Boolean)
    if (validImages.length === 0) return null

    // 选择最稳妥的缩略图：优先 data:image 且含 base64, 其次 http(s)
    const dataImages = validImages.filter((x) => x.startsWith('data:image/') && x.includes('base64,'))
    const httpImages = validImages.filter((x) => x.startsWith('http://') || x.startsWith('https://'))
    const fallbackImages = validImages.filter((x) => !dataImages.includes(x) && !httpImages.includes(x))
    const ordered = [...dataImages, ...httpImages, ...fallbackImages]
    const primary = ordered[0]
    const alternatives = ordered.slice(1)

    return (
      <div className="flex items-center gap-1">
        <img
          src={primary}
          alt="图片"
          className="h-8 w-12 object-cover rounded border border-white/60"
          {...(primary.startsWith('http') ? { crossOrigin: 'anonymous' as any } : {})}
          onError={(e) => {
            const next = alternatives.find((x) => x && x.length > 32)
            if (next) e.currentTarget.src = next
            else e.currentTarget.style.display = 'none'
          }}
        />
        {validImages.length > 1 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
            +{validImages.length - 1}
          </span>
        )}
      </div>
    )
  }
  if (type === "video" && v) {
    // 处理单视频/多视频模式
    const videos = Array.isArray(v) ? v : [v]
    const validVideos = videos.filter(Boolean)

    if (validVideos.length === 0) return null

    return (
      <div className="flex items-center gap-1">
        <div className="relative">
          <video
            src={validVideos[0]}
            className="h-8 w-12 object-cover rounded border border-white/60"
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {validVideos.length > 1 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
            +{validVideos.length - 1}
          </span>
        )}
      </div>
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

  if (type === "progress" && f?.progressConfig) {
    const value = Number(v ?? 0)
    const maxValue = f.progressConfig.maxValue || 100
    const percentage = Math.round((value / maxValue) * 100)

    return (
      <div className="flex items-center gap-2">
        {f.progressConfig.showProgressBar && (
          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-blue-500"
              style={{
                width: `${Math.min(percentage, 100)}%`
              }}
            />
          </div>
        )}
        {f.progressConfig.showPercentage ? (
          <span className="text-xs text-gray-600 w-12 text-right">{percentage}%</span>
        ) : (
          <span className="text-xs text-gray-600">{value}/{maxValue}</span>
        )}
      </div>
    )
  }

  if ((type === "skills" || (type === "multiselect" && f?.preset === "skills")) && Array.isArray(v) && v.length > 0) {
    // 获取技能名称
    const skillNames = v.map((skillId: string) => {
      // 先从预定义技能中查找
      const predefinedSkill = getSkillById(skillId)
      if (predefinedSkill) return predefinedSkill.name

      // 再从自定义技能中查找
      const customSkill = f?.skillsConfig?.customSkills?.find((s: any) => s.id === skillId)
      if (customSkill) return customSkill.name

      return skillId // 如果都找不到，显示ID
    }).filter(Boolean)

    const visibleSkills = skillNames.slice(0, 2)
    const hiddenCount = skillNames.length - visibleSkills.length

    return (
      <div className="flex flex-wrap gap-1 items-center" title={skillNames.join(", ")}>
        {visibleSkills.map((skillName: string, i: number) => (
          <span
            key={i}
            className="text-xs px-1.5 py-0.5 rounded-full border border-white/60 bg-white/70 backdrop-blur shadow-sm"
          >
            {skillName}
          </span>
        ))}
        {hiddenCount > 0 && <span className="text-xs text-muted-foreground ml-1">+{hiddenCount}</span>}
      </div>
    )
  }
  if (type === "cascader") {
    return (
      <div className="truncate" title={valueStr}>
        {valueStr}
      </div>
    )
  }

  if (type === "identity_verification" || (type === "text" && f?.preset === "identity_verification")) {
    if (!v || typeof v !== "object") return <span className="text-gray-400">-</span>
    const hasData = v.name || v.idNumber || v.frontPhoto || v.backPhoto
    if (!hasData) return <span className="text-gray-400">-</span>
    return (
      <div className="text-sm">
        {v.name && <div className="font-medium">{v.name}</div>}
        {v.idNumber && <div className="text-gray-600 text-xs">{v.idNumber}</div>}
        {(v.frontPhoto || v.backPhoto) && (
          <div className="text-blue-600 text-xs mt-1">
            {locale === "zh" ? "已上传照片" : "Photos uploaded"}
          </div>
        )}
      </div>
    )
  }

  if (type === "other_verification" || (type === "text" && f?.preset === "other_verification")) {
    if (!v || typeof v !== "object") return <span className="text-gray-400">-</span>
    const hasData = Object.keys(v).length > 0
    if (!hasData) return <span className="text-gray-400">-</span>

    const textFields = Object.entries(v).filter(([key, value]) =>
      typeof value === "string" && value.trim() !== ""
    )
    const imageFields = Object.entries(v).filter(([key, value]) =>
      Array.isArray(value) && value.length > 0
    )

    return (
      <div className="text-sm">
        {textFields.length > 0 && (
          <div className="text-gray-600 text-xs">
            {locale === "zh" ? "文字信息：" : "Text: "}{textFields.length} {locale === "zh" ? "项" : "items"}
          </div>
        )}
        {imageFields.length > 0 && (
          <div className="text-blue-600 text-xs mt-1">
            {locale === "zh" ? "图片信息：" : "Images: "}{imageFields.length} {locale === "zh" ? "项" : "items"}
          </div>
        )}
      </div>
    )
  }

  // Default text-like fields
  return (
    <div className="truncate" title={valueStr}>
      {valueStr}
    </div>
  )
}
