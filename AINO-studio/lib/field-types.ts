import type { FieldType } from "@/lib/store"

// 字段类型名称映射
export function getFieldTypeNames(t: (key: string) => string): Record<FieldType, string> {
  return {
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
  }
}

// 字段类型分组
export const FIELD_TYPE_GROUPS = {
  basic: ['text', 'textarea', 'number', 'boolean', 'date', 'time'] as FieldType[],
  selection: ['select', 'multiselect', 'checkbox', 'cascader'] as FieldType[],
  media: ['image', 'video', 'file'] as FieldType[],
  advanced: ['richtext', 'tags', 'percent', 'barcode'] as FieldType[],
  relation: ['relation_one', 'relation_many', 'experience'] as FieldType[],
}

// 字段类型默认配置
export const FIELD_TYPE_DEFAULTS: Partial<Record<FieldType, any>> = {
  text: { maxLength: 255 },
  textarea: { maxLength: 1000 },
  number: { min: 0, max: 999999 },
  select: { options: [] },
  multiselect: { options: [] },
  boolean: { defaultValue: false },
  date: { format: 'YYYY-MM-DD' },
  time: { format: 'HH:mm' },
  tags: { maxTags: 10 },
  percent: { min: 0, max: 100, precision: 2 },
}
