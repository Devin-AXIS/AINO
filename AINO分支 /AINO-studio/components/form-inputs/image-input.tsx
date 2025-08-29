"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface ImageInputProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
  defaultImage?: string
  disabled?: boolean
}

export function ImageInput({
  value = "",
  onChange,
  multiple = false,
  defaultImage = "",
  disabled = false,
}: ImageInputProps) {
  const { locale } = useLocale()

  // 处理值的统一格式
  const splitConcatenatedImages = (s: string): string[] => {
    let str = (s ?? "").replace(/^\ufeff/, '').trim()
    if (!str) return []
    // 若包含data:image但非以其起始，裁剪到第一个data:image
    const firstDataIdx = str.indexOf('data:image/')
    if (firstDataIdx > 0) str = str.slice(firstDataIdx)

    // 尝试解析为JSON数组字符串
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
    // 多个 data:image 串被直接拼接的情况：按下一个 data:image 的起始切分
    const dataMarkers = str.match(/data:image\//g) || []
    if (dataMarkers.length > 1) {
      return str
        .split(/(?=data:image\/)/)
        .map((x) => x.trim())
        .filter((x) => x.startsWith('data:image/') || x.startsWith('http://') || x.startsWith('https://'))
    }
    // 多个 http(s) URL 通过逗号拼接的情况：按逗号切分并过滤
    const httpMarkers = str.match(/https?:\/\//g) || []
    if (httpMarkers.length > 1) {
      return str
        .split(/\s*,\s*/)
        .map((x) => x.trim())
        .filter((x) => x.startsWith('http://') || x.startsWith('https://') || x.startsWith('data:image/'))
    }
    // 单个 data:image，但可能拼接了后续图片的裸 base64：尝试按已知结尾标记裁剪
    if (str.startsWith('data:image/')) {
      const pngEnd = 'AAElFTkSuQmCC' // 常见 PNG Base64 末尾
      const jpegEndCandidates = ['/9k=', '/9s=', '/9j/'] // 常见 JPEG 末尾
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

  const normalizeImagesInput = (input: string | string[]): string[] => {
    if (Array.isArray(input)) {
      const result: string[] = []
      for (const item of input) {
        const parts = splitConcatenatedImages(String(item ?? ''))
        for (const p of parts) if (p) result.push(p)
      }
      return result
    }
    return splitConcatenatedImages(input)
  }

  const normalizedArray = useMemo(() => normalizeImagesInput(value as any), [value])
  const images = multiple
    ? normalizedArray
    : (normalizedArray[0] || "")

  // 自动纠正：当传入值与规范化结果不一致时，回写规范化值，修复首张图仍为拼接串的问题
  useEffect(() => {
    if (!onChange) return
    if (multiple) {
      const incoming = Array.isArray(value) ? value : (value ? [String(value)] : [])
      const norm = normalizedArray
      if (incoming.length !== norm.length || incoming.some((v, i) => String(v).trim() !== norm[i])) {
        onChange(norm)
      }
    } else {
      const incoming = Array.isArray(value) ? (value[0] || "") : String(value || "")
      const norm = normalizedArray[0] || ""
      if (incoming.trim() !== norm) {
        onChange(norm)
      }
    }
  }, [value, multiple, onChange, normalizedArray])

  const hasImages = multiple ? (images as string[]).length > 0 : Boolean(images)
  const canUploadMore = multiple || !hasImages

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = multiple
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const newImages: string[] = []

        Array.from(files).forEach((file) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            newImages.push(result)

            // 当所有图片都读取完成时更新数据
            if (newImages.length === files.length) {
              if (multiple) {
                // 多图模式：合并并规范化
                const merged = [...(normalizedArray || []), ...newImages]
                onChange?.(normalizeImagesInput(merged))
              } else {
                // 单图模式：替换现有图片
                onChange?.(newImages[0])
              }
            }
          }
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }

  const removeImage = (imageIndex: number) => {
    if (multiple) {
      const currentImages = normalizedArray
      const newImages = currentImages.filter((_, index) => index !== imageIndex)
      onChange?.(newImages)
    } else {
      onChange?.("")
    }
  }

  // 如果没有图片且有默认图片，显示默认图片
  const showDefaultImage = !hasImages && defaultImage
  const displayImages = showDefaultImage
    ? [defaultImage]
    : (multiple ? images as string[] : [images as string])

  return (
    <div className="space-y-3">
      {/* 已上传的图片或默认图片 */}
      {(hasImages || showDefaultImage) && (
        <div className={`grid gap-3 ${multiple ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 max-w-xs"}`}>
          {displayImages.filter(Boolean).map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative overflow-hidden rounded border">
                <img
                  src={image}
                  alt={`${locale === "zh" ? "图片" : "Image"} ${index + 1}`}
                  className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                />
                {/* 悬停时显示的操作按钮 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        // 预览图片
                        window.open(image, '_blank')
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    {!showDefaultImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeImage(index)}
                        disabled={disabled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* 图片信息 */}
              <div className="mt-1 text-xs text-gray-500 text-center">
                {locale === "zh" ? `图片 ${index + 1}` : `Image ${index + 1}`}
                {showDefaultImage && (
                  <span className="ml-1 text-blue-600">
                    ({locale === "zh" ? "默认" : "Default"})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 - 单图模式下有图片时不显示，多图模式下始终显示 */}
      {canUploadMore && (
        <div
          className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
          onClick={handleImageUpload}
        >
          <div className="text-center">
            <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <div className="text-sm font-medium text-gray-700 mb-1">
              {locale === "zh"
                ? `点击上传图片${multiple && hasImages ? "（追加）" : ""}`
                : `Click to upload image${multiple && hasImages ? " (Add)" : ""}`
              }
            </div>
            <div className="text-xs text-gray-500">
              {multiple
                ? (locale === "zh" ? "支持多选，拖拽上传" : "Multiple selection, drag & drop")
                : (locale === "zh" ? "支持拖拽上传" : "Drag & drop supported")
              }
            </div>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      {multiple && hasImages && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {locale === "zh"
              ? `已上传 ${(images as string[]).length} 张图片`
              : `${(images as string[]).length} images uploaded`
            }
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (multiple) {
                onChange([])
              } else {
                onChange("")
              }
            }}
            disabled={disabled}
            className="h-6 px-2 text-xs"
          >
            {locale === "zh" ? "清除所有" : "Clear All"}
          </Button>
        </div>
      )}
    </div>
  )
}
