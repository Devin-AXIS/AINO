"use client"

import { useState } from "react"
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
  const images = multiple 
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (Array.isArray(value) ? (value[0] || "") : value || "")
  
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
                // 多图模式：追加到现有图片
                const currentImages = (images as string[]) || []
                onChange?.([...currentImages, ...newImages])
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
      const currentImages = images as string[]
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
