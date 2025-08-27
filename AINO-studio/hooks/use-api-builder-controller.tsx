"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale } from "@/hooks/use-locale"
import { useApplicationModules } from "@/hooks/use-application-modules"
import { type ApplicationModule } from "@/lib/api"
import { api } from "@/lib/api"

type DrawerState = {
  open: boolean
  dirId: string | null
  recordId: string | null
  tab: string
}

export type Filters = { kw: string; status: string; category: string }

// 目录模型
export interface DirectoryModel {
  id: string
  name: string
  type: "table" | "category"
  fields: any[]
  categories?: any[]
  records?: any[]
}

// 模块模型，适配API数据
export interface ModuleModel {
  id: string
  name: string
  type: string
  icon: string
  directories: DirectoryModel[]
}

// 目录模板
const dirTemplates = {
  custom: (name?: string): DirectoryModel => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name: name || "新目录",
    type: "table",
    fields: [],
    categories: [],
    records: [],
  }),
  "ecom-product": (name?: string): DirectoryModel => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name: name || "商品管理",
    type: "table",
    fields: [
      { id: "1", key: "name", label: "商品名称", type: "text", required: true, showInList: true },
      { id: "2", key: "price", label: "价格", type: "number", required: true, showInList: true },
      { id: "3", key: "category", label: "分类", type: "select", required: false, showInList: true },
    ],
    categories: [],
    records: [],
  }),
  "ecom-order": (name?: string): DirectoryModel => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name: name || "订单管理",
    type: "table",
    fields: [
      { id: "1", key: "orderNo", label: "订单号", type: "text", required: true, showInList: true },
      { id: "2", key: "customer", label: "客户", type: "text", required: true, showInList: true },
      { id: "3", key: "amount", label: "金额", type: "number", required: true, showInList: true },
    ],
    categories: [],
    records: [],
  }),
}

export function useApiBuilderController({
  appId,
  can,
  toast,
}: {
  appId: string
  can: (action: "view" | "edit" | "delete" | "bulkDelete" | "managePermissions") => boolean
  toast: (opts: { description: string; variant?: any }) => void
}) {
  const { t, locale } = useLocale()
  
  // 使用API获取应用和模块数据
  const {
    data,
    application,
    modules,
    isLoading,
    error,
    fetchModules,
  } = useApplicationModules(appId)

  const [moduleId, setModuleId] = useState<string | null>(null)
  const [dirId, setDirId] = useState<string | null>(null)

  const [filters, setFilters] = useState<Filters>({ kw: "", status: "all", category: "all" })
  const [tab, setTab] = useState<"list" | "fields">("list")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [drawer, setDrawer] = useState<DrawerState>({ open: false, dirId: null, recordId: null, tab: "basic" })

  // Dialog states
  const [openAddModule, setOpenAddModule] = useState(false)
  const [openAddDir, setOpenAddDir] = useState(false)
  const [openAddField, setOpenAddField] = useState(false)

  const [renameModuleOpen, setRenameModuleOpen] = useState(false)
  const [renameModuleName, setRenameModuleName] = useState("")
  const [renameDirOpen, setRenameDirOpen] = useState(false)
  const [renameDirName, setRenameDirName] = useState("")
  const [renameDirTargetId, setRenameDirTargetId] = useState<string | null>(null)

  const [openCategory, setOpenCategory] = useState(false)
  const [openCategorySelection, setOpenCategorySelection] = useState(false)

  // 目录数据状态
  const [directoriesData, setDirectoriesData] = useState<Record<string, DirectoryModel[]>>({})
  const [directoriesLoading, setDirectoriesLoading] = useState<Record<string, boolean>>({})
  
  // 记录数据状态
  const [recordsData, setRecordsData] = useState<Record<string, any[]>>({})
  const [recordsLoading, setRecordsLoading] = useState<Record<string, boolean>>({})

  // 获取目录数据的函数
  const fetchDirectories = async (moduleId: string) => {
    if (directoriesLoading[moduleId]) return
    
    setDirectoriesLoading(prev => ({ ...prev, [moduleId]: true }))
    
    try {
      const response = await api.directories.getDirectories({
        applicationId: appId,
        moduleId: moduleId,
      })
      
      if (response.success && response.data) {
        // 将API数据转换为前端需要的格式
        const directories = response.data.directories.map((dir: any) => ({
          id: dir.id,
          name: dir.name,
          type: dir.type,
          fields: dir.config?.fields || [],
          categories: dir.config?.categories || [],
          records: [],
        }))
        
        setDirectoriesData(prev => ({
          ...prev,
          [moduleId]: directories
        }))
      }
    } catch (error) {
      console.error("获取目录数据失败:", error)
      toast({
        description: locale === "zh" ? "获取目录数据失败" : "Failed to fetch directories",
        variant: "destructive",
      })
    } finally {
      setDirectoriesLoading(prev => ({ ...prev, [moduleId]: false }))
    }
  }

  // 获取记录数据的函数
  const fetchRecords = async (dirId: string) => {
    if (recordsLoading[dirId]) return
    
    setRecordsLoading(prev => ({ ...prev, [dirId]: true }))
    
    try {
      const response = await api.records.listRecords(dirId, {
        page: 1,
        pageSize: 100, // 获取更多记录
      })
      
      if (response.success && response.data) {
        // 后端返回格式: { data: [...], pagination: {...} }
        // 前端期望格式: 直接是记录数组
        const records = Array.isArray(response.data) ? response.data : response.data.records || response.data
        setRecordsData(prev => ({
          ...prev,
          [dirId]: records
        }))
      }
    } catch (error) {
      console.error("获取记录数据失败:", error)
      toast({
        description: locale === "zh" ? "获取记录数据失败" : "Failed to fetch records",
        variant: "destructive",
      })
    } finally {
      setRecordsLoading(prev => ({ ...prev, [dirId]: false }))
    }
  }

  // 将API模块数据转换为ModuleModel格式，并合并目录数据
  const apiModules = useMemo<ModuleModel[]>(() => {
    return modules.map((module: ApplicationModule) => ({
      id: module.id,
      name: module.name,
      type: module.type,
      icon: module.icon,
      directories: (directoriesData[module.id] || []).map(dir => ({
        ...dir,
        records: recordsData[dir.id] || []
      }))
    }))
  }, [modules, directoriesData, recordsData])

  // 设置默认选中的模块
  useEffect(() => {
    if (apiModules.length > 0 && !moduleId) {
      setModuleId(apiModules[0].id)
    }
  }, [apiModules, moduleId])

  // 当模块ID变化时，获取该模块的目录数据
  useEffect(() => {
    if (moduleId && appId) {
      fetchDirectories(moduleId)
    }
  }, [moduleId, appId])

  const currentModule = useMemo<ModuleModel | null>(() => {
    if (!moduleId) return null
    return apiModules.find((m) => m.id === moduleId) || null
  }, [apiModules, moduleId])

  // select default directory
  useEffect(() => {
    if (!currentModule) return
    if (!dirId && currentModule.directories.length > 0) {
      setDirId(currentModule.directories[0].id)
    }
  }, [currentModule, dirId])

  const currentDir = useMemo<DirectoryModel | null>(() => {
    if (!currentModule || !dirId) return null
    return currentModule.directories.find((d) => d.id === dirId) || null
  }, [currentModule, dirId])

  // 当目录ID变化时，获取该目录的记录数据
  useEffect(() => {
    if (currentDir && currentDir.type === "table") {
      fetchRecords(currentDir.id)
    }
  }, [currentDir])

  // reset selection when directory or filters change
  useEffect(() => {
    setSelectedIds([])
  }, [dirId, filters.kw, filters.status, filters.category])

  // 错误处理
  useEffect(() => {
    if (error) {
      toast({
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // 添加缺失的方法
  async function handleCreateDirectoryFromDialog(payload: { name: string; templateKey: string }) {
    if (!currentModule) return
    if (!can("edit")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权创建目录" : "Current role has no permission to create directory", 
        variant: "destructive" 
      })
      return
    }

    try {
      const response = await api.directories.createDirectory({
        name: payload.name,
        type: "table",
        supportsCategory: false,
        config: {},
        order: 0,
      }, {
        applicationId: appId,
        moduleId: currentModule.id,
      })

      if (response.success && response.data) {
        // 重新获取目录数据
        await fetchDirectories(currentModule.id)
        
        // 设置新创建的目录为当前目录
        setDirId(response.data.id)
        setOpenAddDir(false)
        
        toast({
          description: locale === "zh" ? `目录「${payload.name}」创建成功` : `Directory "${payload.name}" created successfully`,
        })
      }
    } catch (error) {
      console.error("创建目录失败:", error)
      toast({
        description: locale === "zh" ? "创建目录失败" : "Failed to create directory",
        variant: "destructive",
      })
    }
  }

  function handleCreateModuleFromDialog(payload: { name: string; templateKey: string }) {
    // 临时实现，后续可以连接到API
    toast({
      description: locale === "zh" ? "创建模块功能正在开发中" : "Create module feature is under development",
    })
  }

  function persist(app: any) {
    // 临时实现，后续可以连接到API
    console.log("Persist app:", app)
  }

  async function addRecord() {
    if (!currentDir) return
    if (!can("edit")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权添加记录" : "Current role has no permission to add record", 
        variant: "destructive" 
      })
      return
    }

    try {
      // 打开记录抽屉进行创建
      setDrawer({ open: true, dirId: currentDir.id, recordId: null, tab: "basic" })
    } catch (error) {
      console.error("添加记录失败:", error)
      toast({
        description: locale === "zh" ? "添加记录失败" : "Failed to add record",
        variant: "destructive",
      })
    }
  }

  function openDrawer(dirId: string, recordId: string) {
    setDrawer({ open: true, dirId, recordId, tab: "basic" })
  }

  function closeDrawer() {
    setDrawer({ open: false, dirId: null, recordId: null, tab: "basic" })
  }

  function quickOpenAddField() {
    setOpenAddField(true)
  }

  function openRenameModule() {
    if (!currentModule) return
    setRenameModuleName(currentModule.name)
    setRenameModuleOpen(true)
  }

  function handleRenameModule(name?: string) {
    if (!currentModule) return
    if (!can("edit")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权重命名模块" : "Current role has no permission to rename module", 
        variant: "destructive" 
      })
      return
    }
    const newName = (name || renameModuleName).trim()
    if (!newName) return
    // 临时实现
    toast({
      description: locale === "zh" ? "重命名模块功能正在开发中" : "Rename module feature is under development",
    })
    setRenameModuleOpen(false)
  }

  async function renameDir(d: any) {
    if (!can("edit")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权重命名目录" : "Current role has no permission to rename directory", 
        variant: "destructive" 
      })
      return
    }
    setRenameDirTargetId(d.id)
    setRenameDirName(d.name)
    setRenameDirOpen(true)
  }

  async function handleRenameDir(name?: string) {
    if (!currentModule || !renameDirTargetId) return
    const newName = (name || renameDirName).trim()
    if (!newName) return
    
    try {
      const response = await api.directories.updateDirectory(renameDirTargetId, {
        name: newName,
      })

      if (response.success) {
        // 重新获取目录数据
        await fetchDirectories(currentModule.id)
        
        toast({
          description: locale === "zh" ? `目录重命名为「${newName}」` : `Directory renamed to "${newName}"`,
        })
        setRenameDirOpen(false)
      }
    } catch (error) {
      console.error("重命名目录失败:", error)
      toast({
        description: locale === "zh" ? "重命名目录失败" : "Failed to rename directory",
        variant: "destructive",
      })
    }
  }

  async function deleteDir(d: any) {
    if (!currentModule) return
    if (!can("delete")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权删除目录" : "Current role has no permission to delete directory", 
        variant: "destructive" 
      })
      return
    }
    
    // 检查目录是否有记录
    if (d.records && d.records.length > 0) {
      toast({ 
        description: locale === "zh" 
          ? `无法删除目录「${d.name}」，请先删除目录中的 ${d.records.length} 条记录`
          : `Cannot delete directory "${d.name}", please delete ${d.records.length} records first`, 
        variant: "destructive" 
      })
      return
    }

    try {
      const response = await api.directories.deleteDirectory(d.id)

      if (response.success) {
        // 重新获取目录数据
        await fetchDirectories(currentModule.id)
        
        // 如果删除的是当前目录，切换到第一个可用目录
        if (dirId === d.id) {
          const remainingDirs = directoriesData[currentModule.id]?.filter(dir => dir.id !== d.id) || []
          setDirId(remainingDirs.length > 0 ? remainingDirs[0].id : null)
        }
        
        toast({
          description: locale === "zh" ? `目录「${d.name}」已删除` : `Directory "${d.name}" deleted`,
        })
      }
    } catch (error) {
      console.error("删除目录失败:", error)
      toast({
        description: locale === "zh" ? "删除目录失败" : "Failed to delete directory",
        variant: "destructive",
      })
    }
  }

  async function handleSaveCategories(newCats: any[]) {
    if (!currentDir || !appId) return
    
    try {
      // 获取现有的分类
      const existingCategories = currentDir.categories || []
      
      // 找出新增的分类
      const newCategories = newCats.filter(newCat => 
        !existingCategories.some(existingCat => existingCat.id === newCat.id)
      )
      
      // 为每个新分类调用API
      for (const category of newCategories) {
        await api.recordCategories.createRecordCategory({
          name: category.name,
          order: newCats.indexOf(category),
          enabled: true,
          parentId: undefined // 暂时只支持一级分类
        }, {
          applicationId: appId,
          directoryId: currentDir.id
        })
      }
      
      // 更新本地状态
      const updatedDir = {
        ...currentDir,
        categories: newCats
      }
      
      // 更新目录数据
      setDirectoriesData(prev => ({
        ...prev,
        [currentModule?.id || '']: prev[currentModule?.id || '']?.map(dir => 
          dir.id === currentDir.id ? updatedDir : dir
        ) || []
      }))
      
      toast({
        description: locale === "zh" ? "分类保存成功" : "Categories saved successfully",
      })
      setOpenCategory(false)
    } catch (error) {
      console.error("保存分类失败:", error)
      toast({
        description: locale === "zh" ? "保存分类失败，请重试" : "Failed to save categories, please try again",
        variant: "destructive"
      })
    }
  }

  async function handleSingleDelete(rid: string) {
    if (!currentDir) return
    if (!can("delete")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权删除记录" : "Current role has no permission to delete record", 
        variant: "destructive" 
      })
      return
    }

    try {
      const response = await api.records.deleteRecord(currentDir.id, rid)
      
      if (response.success) {
        // 重新获取记录数据
        await fetchRecords(currentDir.id)
        
        toast({
          description: locale === "zh" ? "记录删除成功" : "Record deleted successfully",
        })
      }
    } catch (error) {
      console.error("删除记录失败:", error)
      toast({
        description: locale === "zh" ? "删除记录失败" : "Failed to delete record",
        variant: "destructive",
      })
    }
  }

  function handleBulkDelete() {
    if (!can("bulkDelete")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权批量删除" : "Current role has no permission to bulk delete", 
        variant: "destructive" 
      })
      return
    }
    // 临时实现
    toast({
      description: locale === "zh" ? "批量删除功能正在开发中" : "Bulk delete feature is under development",
    })
  }

  function createRecordWithCategory(categoryPath: string[]) {
    // 临时实现
    toast({
      description: locale === "zh" ? "创建分类记录功能正在开发中" : "Create category record feature is under development",
    })
  }

  return {
    // 数据状态
    app: application ? {
      id: application.id,
      name: application.name,
      desc: application.description,
      modules: apiModules,
    } : null,
    modules: apiModules,
    currentModule,
    currentDir,
    
    // 选择状态
    moduleId,
    setModuleId,
    dirId,
    setDirId,
    
    // 过滤和标签页
    filters,
    setFilters,
    tab,
    setTab,
    selectedIds,
    setSelectedIds,
    
    // 抽屉状态
    drawer,
    setDrawer,
    
    // 对话框状态
    openAddModule,
    setOpenAddModule,
    openAddDir,
    setOpenAddDir,
    openAddField,
    setOpenAddField,
    renameModuleOpen,
    setRenameModuleOpen,
    renameModuleName,
    setRenameModuleName,
    renameDirOpen,
    setRenameDirOpen,
    renameDirName,
    setRenameDirName,
    renameDirTargetId,
    setRenameDirTargetId,
    openCategory,
    setOpenCategory,
    openCategorySelection,
    setOpenCategorySelection,
    
    // 加载状态
    isLoading,
    error,
    
    // 刷新方法
    refresh: fetchModules,

    // 添加缺失的方法
    persist,
    addRecord,
    openDrawer,
    closeDrawer,
    quickOpenAddField,
    handleCreateModuleFromDialog,
    handleCreateDirectoryFromDialog,
    openRenameModule,
    handleRenameModule,
    renameDir,
    handleRenameDir,
    deleteDir,
    handleSaveCategories,
    handleSingleDelete,
    handleBulkDelete,
    createRecordWithCategory,
  }
}
