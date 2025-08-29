"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Video as VideoIcon, Play } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"
import { api } from "@/lib/api"

interface VideoInputProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
  defaultVideo?: string
  disabled?: boolean
}

export function VideoInput({
  value = "",
  onChange,
  multiple = false,
  defaultVideo = "",
  disabled = false,
}: VideoInputProps) {
  const { locale } = useLocale()

  // 处理值的统一格式
  const videos = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (Array.isArray(value) ? (value[0] || "") : value || "")

  const hasVideos = multiple ? (videos as string[]).length > 0 : Boolean(videos)
  const canUploadMore = multiple || !hasVideos

  const handleVideoUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "video/*"
    input.multiple = multiple
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const fileList = Array.from(files)
        // 直接上传到服务器，使用返回的 URL
        api.uploads.uploadVideos(fileList)
          .then((res) => {
            if (res.success && res.data?.files) {
              const urls = res.data.files.map(f => f.url).filter(Boolean)
              if (urls.length === 0) return
              if (multiple) {
                const currentVideos = (videos as string[]) || []
                onChange?.([...currentVideos, ...urls])
              } else {
                onChange?.(urls[0])
              }
            }
          })
          .catch(() => {
            // 简单忽略错误，外层表单有统一提示
          })
      }
    }
    input.click()
  }

  const removeVideo = (videoIndex: number) => {
    if (multiple) {
      const currentVideos = videos as string[]
      const newVideos = currentVideos.filter((_, index) => index !== videoIndex)
      onChange?.(newVideos)
    } else {
      onChange?.("")
    }
  }

  // 如果没有视频且有默认视频，显示默认视频
  const showDefaultVideo = !hasVideos && defaultVideo
  const displayVideos = showDefaultVideo
    ? [defaultVideo]
    : (multiple ? videos as string[] : [videos as string])

  return (
    <div className="space-y-2">
      {/* 已上传的视频或默认视频 */}
      {(hasVideos || showDefaultVideo) && (
        <div className={`grid gap-3 ${multiple ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-md"}`}>
          {displayVideos.filter(Boolean).map((video, index) => (
            <div key={index} className="relative">
              <video
                src={video}
                className="w-full h-32 object-cover rounded border"
                controls
                preload="metadata"
              />
              {/* 只有非默认视频才显示删除按钮 */}
              {!showDefaultVideo && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeVideo(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {/* 默认视频标识 */}
              {showDefaultVideo && (
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                  {locale === "zh" ? "默认" : "Default"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮 - 单视频模式下有视频时不显示，多视频模式下始终显示 */}
      {canUploadMore && (
        <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded">
          <VideoIcon className="h-8 w-8 text-gray-400 mb-2" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleVideoUpload}
            disabled={disabled}
            className="gap-1"
          >
            <Upload className="h-4 w-4" />
            {locale === "zh"
              ? `上传视频${multiple && hasVideos ? "（追加）" : ""}`
              : `Upload Video${multiple && hasVideos ? " (Add)" : ""}`
            }
          </Button>
        </div>
      )}

      {/* 提示信息 */}
      {multiple && (
        <div className="text-xs text-gray-500">
          {locale === "zh"
            ? "支持选择多个视频文件进行批量上传"
            : "Select multiple video files for batch upload"
          }
        </div>
      )}
    </div>
  )
}
