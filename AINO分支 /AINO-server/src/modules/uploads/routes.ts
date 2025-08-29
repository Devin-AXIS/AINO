import { Hono } from 'hono'
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { extname } from 'node:path'
import { mockRequireAuthMiddleware } from '../../middleware/auth'

const uploadBaseDir = 'uploads'
const videoDir = `${uploadBaseDir}/videos`

function ensureDirs() {
    if (!existsSync(uploadBaseDir)) mkdirSync(uploadBaseDir)
    if (!existsSync(videoDir)) mkdirSync(videoDir)
}

export const uploadsRoute = new Hono()

uploadsRoute.use('*', mockRequireAuthMiddleware)

uploadsRoute.post('/video', async (c) => {
    try {
        ensureDirs()

        // 统一从 form-data/body 读取
        const ct = c.req.header('content-type') || ''
        let files: File[] = []

        if (ct.includes('multipart/form-data')) {
            const form = await c.req.parseBody()
            // 优先使用字段名 files，其次 file；也兼容其他键里传来的 File
            const candidates = [] as any[]
            if (form['files']) candidates.push(form['files'])
            if (form['file']) candidates.push(form['file'])
            // 扫描所有值，收集 File/Blob
            Object.values(form).forEach((v) => candidates.push(v as any))

            for (const item of candidates) {
                if (!item) continue
                if (Array.isArray(item)) {
                    for (const i of item) if (i && typeof i === 'object' && 'arrayBuffer' in i) files.push(i as File)
                } else if (typeof item === 'object' && 'arrayBuffer' in item) {
                    files.push(item as File)
                }
            }
        } else {
            return c.json({ success: false, error: 'Content-Type 必须为 multipart/form-data' }, 400)
        }

        if (files.length === 0) {
            return c.json({ success: false, error: '未找到上传文件' }, 400)
        }

        const saved: { name: string; url: string; size: number; type: string }[] = []
        for (const file of files) {
            const buf = Buffer.from(await file.arrayBuffer())
            const safeExt = extname(file.name || '') || '.mp4'
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`
            const fullPath = `${videoDir}/${filename}`
            writeFileSync(fullPath, buf)

            const url = `/uploads/videos/${filename}`
            saved.push({ name: file.name || filename, url, size: buf.length, type: (file as any).type || 'video/*' })
        }

        return c.json({ success: true, data: { files: saved } }, 201)
    } catch (err: any) {
        console.error('视频上传失败:', err)
        return c.json({ success: false, error: '上传失败', detail: String(err?.message || err) }, 500)
    }
})


