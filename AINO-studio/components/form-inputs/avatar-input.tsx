"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, User } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface AvatarInputProps {
  value?: string
  onChange?: (value: string) => void
  defaultImage?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function AvatarInput({
  value = "",
  onChange,
  defaultImage = "",
  disabled = false,
  size = "md",
}: AvatarInputProps) {
  const { locale } = useLocale()
  
  const hasImage = Boolean(value)
  const showDefaultImage = !hasImage && defaultImage
  const displayImage = showDefaultImage ? defaultImage : value

  // Size classes
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20", 
    lg: "w-32 h-32"
  }

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const file = files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          onChange?.(result)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const removeImage = () => {
    onChange?.("")
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Avatar Display */}
      <div className="relative">
        {displayImage ? (
          <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200`}>
            <img
              src={displayImage}
              alt={locale === "zh" ? "头像" : "Avatar"}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`${sizeClasses[size]} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50`}>
            <User className={`${iconSizes[size]} text-gray-400`} />
          </div>
        )}
        
        {/* Remove button - only show for non-default images */}
        {hasImage && !showDefaultImage && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-1 -right-1 h-6 w-6 p-0 rounded-full"
            onClick={removeImage}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        {/* Default image indicator */}
        {showDefaultImage && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {locale === "zh" ? "默认" : "Default"}
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleImageUpload}
        disabled={disabled}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {locale === "zh" ? "上传头像" : "Upload Avatar"}
      </Button>

      {/* Hint text */}
      <div className="text-xs text-gray-500 text-center max-w-32">
        {locale === "zh" 
          ? "支持 JPG、PNG 格式，建议正方形图片" 
          : "Supports JPG, PNG format, square image recommended"
        }
      </div>
    </div>
  )
}
