// resourceLoader.ts

/** 已加载的脚本缓存 */
const loadedScripts = new Set<string>()
/** 已加载的样式缓存 */
const loadedStyles = new Set<string>()

/**
 * 从 npm 包 node_modules 中动态加载 JS 脚本到 <head>
 * Vite 环境下通过 import 获取资源 URL，支持开发与生产模式
 */
export async function loadScriptFromNodeModules(importFn: () => Promise<any>, id?: string): Promise<void> {
    // 通过 Vite 的静态资源导入获取实际 URL
    const module = await importFn()
    const url: string = module.default || module
    if (loadedScripts.has(url)) return
    if (id && document.getElementById(id)) return

    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = url
        script.async = false  // 保证按顺序执行
        if (id) script.id = id
        script.onload = () => {
            loadedScripts.add(url)
            resolve()
        }
        script.onerror = () => reject(new Error(`脚本加载失败: ${url}`))
        document.head.appendChild(script)
    })
}

/**
 * 从 npm 包 node_modules 中动态加载 CSS 样式到 <head>
 */
export async function loadCSSFromNodeModules(importFn: () => Promise<any>, id?: string): Promise<void> {
    const module = await importFn()
    const url: string = module.default || module
    if (loadedStyles.has(url)) return
    if (id && document.getElementById(id)) return

    return new Promise((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = url
        if (id) link.id = id
        link.onload = () => {
            loadedStyles.add(url)
            resolve()
        }
        link.onerror = () => reject(new Error(`样式加载失败: ${url}`))
        document.head.appendChild(link)
    })
}

/**
 * 获取 wsplayer-lz 包中静态文件的完整 URL
 * @param relativePath 相对于包根目录的路径
 */
export function getWSPlayerAssetPath(relativePath: string): string {
    // 方式一：通过 import.meta.url 动态拼接（推荐）
    try {
        return new URL(`/node_modules/zhui-plus/dist/WSPlayer/${relativePath}`, import.meta.url).href
    } catch {
        // 方式二：回退到 public 路径
        return `/node_modules/zhui-plus/dist/WSPlayer/${relativePath}`
    }
}
