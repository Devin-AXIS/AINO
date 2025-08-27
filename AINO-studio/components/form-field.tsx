"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import type { AppModel, FieldModel, RecordRow } from "@/lib/store"
import { CascaderSelect } from "@/components/cascader-select"
import { CitySelect } from "@/components/city-select"
import { CountrySelect } from "@/components/country-select"
import { RatingInput } from "@/components/rating-input"
import { CurrencyInput } from "@/components/currency-input"
import { UserSelect } from "@/components/user-select"
import { ExperienceEditor } from "@/components/experience-editor"
import { ConstellationSelect } from "@/components/constellation-select"
import { SkillsSelect } from "@/components/skills-select"
import { IdentityVerificationInput } from "@/components/form-inputs/identity-verification-input"
import { OtherVerificationInput } from "@/components/form-inputs/other-verification-input"
import { ImageInput } from "@/components/form-inputs/image-input"
import { VideoInput } from "@/components/form-inputs/video-input"

import { ModernDateInput } from "@/components/form-inputs/modern-date-input"
import { MultiSelectInput } from "@/components/form-inputs/multi-select-input"
import { TagInput } from "@/components/form-inputs/tag-input"
import { RelationInput } from "@/components/form-inputs/relation-input"

function renderInput(field: FieldModel, record: RecordRow, onChange: (v: any) => void, app: AppModel) {
  const value = (record as any)[field.key]

  // Handle presets first
  if (field.preset) {
    switch (field.preset) {
      case "user_select":
        return <UserSelect app={app} value={value} onChange={onChange} isMulti={field.type === "relation_many"} />
      case "city":
        return <CitySelect value={value || ""} onChange={onChange} />
      case "country":
        return <CountrySelect value={value || ""} onChange={onChange} />
      case "rating":
        return <RatingInput value={value || 0} onChange={onChange} />
      case "currency":
        return <CurrencyInput value={value} onChange={onChange} />
      case "phone":
        return (
          <Input
            type="tel"
            className="bg-white"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入手机号"
          />
        )
      case "email":
        return (
          <Input
            type="email"
            className="bg-white"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入邮箱"
          />
        )
      case "url":
        return (
          <Input
            type="url"
            className="bg-white"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com"
          />
        )
      case "skills":
        return (
          <SkillsSelect
            value={value || []}
            onChange={onChange}
            allowedCategories={field.skillsConfig?.allowedCategories}
            maxSkills={field.skillsConfig?.maxSkills}
            showLevel={field.skillsConfig?.showLevel}
          />
        )
      case "identity_verification":
        return (
          <IdentityVerificationInput
            value={value || {}}
            onChange={onChange}
            config={field.identityVerificationConfig}
          />
        )
      case "other_verification":
        return (
          <OtherVerificationInput
            value={value || {}}
            onChange={onChange}
            config={field.otherVerificationConfig}
          />
        )
      default:
        break
    }
  }

  switch (field.type) {
    case "richtext":
    case "textarea":
      return <Textarea className="bg-white" rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    case "number":
      return (
        <Input
          type="number"
          className="bg-white"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )
    case "percent":
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            step={1}
            className="bg-white"
            value={value ?? ""}
            onChange={(e) => {
              const n = e.target.value === "" ? null : Math.max(0, Math.min(100, Number(e.target.value)))
              onChange(n)
            }}
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      )
    case "checkbox":
    case "boolean":
      return (
        <div className="flex items-center space-x-2 pt-2">
          <Switch id={`switch-${field.id}`} checked={!!value} onCheckedChange={onChange} />
          <Label htmlFor={`switch-${field.id}`}>{value ? field.trueLabel || "是" : field.falseLabel || "否"}</Label>
        </div>
      )
    case "select":
      return (
        <Select value={value || ""} onValueChange={(x) => onChange(x)}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="请选择..." />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "multiselect":
      return <MultiSelectInput field={field} value={value} onChange={onChange} />
    case "tags":
      return <TagInput value={value} onChange={onChange} />
    case "date":
      return <ModernDateInput field={field} value={value} onChange={onChange} />
    case "time":
      return <Input type="time" className="bg-white" value={value || ""} onChange={(e) => onChange(e.target.value)} />
    case "file":
      return (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            className="bg-white"
            accept={field.accept || "*/*"}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              onChange(file.name)
            }}
          />
          {value && (
            <span className="text-xs rounded-full border bg-white px-2 py-0.5" title="文件名">
              {String(value)}
            </span>
          )}
        </div>
      )
    case "image":
      return (
        <ImageInput
          value={value}
          onChange={onChange}
          multiple={field.imageConfig?.multiple || false}
          defaultImage={field.imageConfig?.defaultImage || ""}
        />
      )
    case "video":
      return (
        <VideoInput
          value={value}
          onChange={onChange}
          multiple={field.videoConfig?.multiple || false}
          defaultVideo={field.videoConfig?.defaultVideo || ""}
        />
      )
    case "barcode":
      return <Input className="bg-white" value={value || ""} onChange={(e) => onChange(e.target.value)} />
    case "cascader":
      return (
        <CascaderSelect
          tree={field.cascaderOptions || []}
          value={value || "all"}
          onChange={onChange}
          placeholder="请选择..."
          clearText="清除选择"
        />
      )
    case "relation_one":
    case "relation_many":
      return <RelationInput app={app} field={field} value={value} onChange={onChange} />
    case "experience":
      return <ExperienceEditor value={value || []} onChange={onChange} className="bg-white rounded-md p-2" field={field} />
    case "constellation":
      return <ConstellationSelect value={value || ""} onChange={onChange} />
    case "skills":
      return (
        <SkillsSelect
          value={value || []}
          onChange={onChange}
          allowedCategories={field.skillsConfig?.allowedCategories}
          maxSkills={field.skillsConfig?.maxSkills}
          showLevel={field.skillsConfig?.showLevel}
          customCategories={field.skillsConfig?.customCategories}
          customSkills={field.skillsConfig?.customSkills}
        />
      )
    case "progress":
      return (
        <div className="space-y-2">
          <Input
            type="number"
            min={0}
            max={field.progressConfig?.maxValue || 100}
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="bg-white"
            placeholder={`0-${field.progressConfig?.maxValue || 100}`}
          />
          {field.progressConfig?.showProgressBar && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                  style={{
                    width: `${Math.min((value || 0) / (field.progressConfig?.maxValue || 100) * 100, 100)}%`
                  }}
                />
              </div>
              {field.progressConfig?.showPercentage && (
                <span className="text-xs text-gray-600 w-12 text-right">
                  {Math.round((value || 0) / (field.progressConfig?.maxValue || 100) * 100)}%
                </span>
              )}
            </div>
          )}
        </div>
      )
    default:
      return <Input className="bg-white" value={value || ""} onChange={(e) => onChange(e.target.value)} />
  }
}

interface FormFieldProps {
  field: FieldModel
  record: RecordRow
  app: AppModel
  onChange: (value: any) => void
}

export function FormField({ field, record, app, onChange }: FormFieldProps) {
  // 对于experience类型的字段，不显示外层标签，避免重复标题
  if (field.type === "experience") {
    return (
      <div className="space-y-2">
        {renderInput(field, record, onChange, app)}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </div>
      {renderInput(field, record, onChange, app)}
    </div>
  )
}
