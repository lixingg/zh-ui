// scripts/generate-resolver.ts
import {
    readdirSync,
    statSync,
    writeFileSync,
    existsSync,
    mkdirSync
} from 'fs'
import { resolve, relative, basename, join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ESM 模块路径处理
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============= 类型定义 =============
interface ComponentInfo {
    /** 组件原始名称（文件名去掉扩展名） */
    rawName: string
    /** 组件驼峰名称 */
    pascalName: string
    /** 组件映射键名（Zh + 驼峰名） */
    mapKey: string
    /** 组件文件相对路径（不含扩展名） */
    relativePath: string
    /** 完整映射值路径 */
    mapValue: string
    /** 是否为子组件 */
    isSubComponent: boolean
    /** 父组件名称 */
    parentName?: string
    /** 所在目录层级 */
    depth: number
}

interface ScannerOptions {
    /** packages 根目录 */
    packagesDir: string
    /** 组件前缀 */
    prefix?: string
    /** 最大扫描深度 */
    maxDepth?: number
    /** 排除的目录名 */
    excludeDirs?: string[]
    /** 组件文件扩展名 */
    componentExtensions?: string[]
}

// ============= 组件扫描器 =============
class ComponentScanner {
    private options: Required<ScannerOptions>
    private components: ComponentInfo[] = []
    private componentsDir: string

    constructor(options: ScannerOptions) {
        this.options = {
            prefix: 'Zh',
            maxDepth: 5,
            excludeDirs: [
                'node_modules',
                '__tests__',
                'test',
                'tests',
                'utils',
                'hooks',
                'composables',
                'style',
                'styles',
                'assets',
                'demo',
                'docs',
                'dist',
                'lib',
                'es'
            ],
            componentExtensions: ['.vue', '.tsx', '.jsx'],
            ...options
        }
        this.componentsDir = resolve(options.packagesDir, 'components')
    }

    /**
     * 开始扫描
     */
    scan(): ComponentInfo[] {
        console.log('🔍 开始扫描组件目录...\n')
        console.log(`📁 组件根目录: ${this.componentsDir}\n`)

        this.components = []

        if (!existsSync(this.componentsDir)) {
            throw new Error(`组件目录不存在: ${this.componentsDir}`)
        }

        // 扫描顶层目录
        this._scanDirectory(this.componentsDir, 0)

        // 排序
        this.components.sort((a, b) => {
            if (a.depth !== b.depth) return a.depth - b.depth
            return a.pascalName.localeCompare(b.pascalName)
        })

        return this.components
    }

    /**
     * 递归扫描目录
     */
    private _scanDirectory(
        currentDir: string,
        depth: number,
        parentComponent?: ComponentInfo
    ): void {
        if (depth > this.options.maxDepth) return

        const dirName = basename(currentDir)

        // 跳过排除的目录
        if (this.options.excludeDirs.includes(dirName)) return

        // 跳过隐藏目录
        if (dirName.startsWith('.') || dirName.startsWith('_')) return

        try {
            const entries = readdirSync(currentDir)

            // 1. 检查是否有 src 目录
            if (entries.includes('src')) {
                // 处理 src 目录下的组件
                this._processSrcDirectory(currentDir, depth, parentComponent)
            } else {
                // 2. 检查当前目录是否有组件文件
                const componentFiles = this._findComponentFiles(currentDir, entries)

                if (componentFiles.length > 0) {
                    // 处理当前目录下的组件
                    const mainComponent = this._processComponentFiles(
                        currentDir,
                        componentFiles,
                        depth,
                        parentComponent
                    )

                    // 继续扫描子目录
                    this._scanSubDirectories(
                        currentDir,
                        entries,
                        depth + 1,
                        mainComponent || parentComponent
                    )
                } else {
                    // 3. 没有组件文件，继续扫描子目录
                    this._scanSubDirectories(currentDir, entries, depth, parentComponent)
                }
            }
        } catch (error) {
            console.warn(`⚠️  无法读取目录: ${currentDir}`)
        }
    }

    /**
     * 处理 src 目录
     */
    private _processSrcDirectory(
        parentDir: string,
        depth: number,
        parentComponent?: ComponentInfo
    ): void {
        const srcPath = join(parentDir, 'src')

        try {
            const srcEntries = readdirSync(srcPath)

            // 查找 src 下的组件文件
            const componentFiles = this._findComponentFiles(srcPath, srcEntries)

            if (componentFiles.length > 0) {
                // 处理组件文件
                const mainComponent = this._processComponentFiles(
                    srcPath,
                    componentFiles,
                    depth,
                    parentComponent,
                    true // 标记来自 src 目录
                )

                // 查找 src 下的子目录（可能是子组件）
                const subDirs = srcEntries.filter(entry => {
                    const fullPath = join(srcPath, entry)
                    return statSync(fullPath).isDirectory() &&
                        !this.options.excludeDirs.includes(entry) &&
                        !entry.startsWith('.') &&
                        !entry.startsWith('_')
                })

                // 扫描子目录
                subDirs.forEach(subDir => {
                    const fullPath = join(srcPath, subDir)
                    this._scanDirectory(fullPath, depth + 1, mainComponent || parentComponent)
                })
            }

            // 继续扫描父目录下的其他子目录（非 src）
            const parentEntries = readdirSync(parentDir)
            this._scanSubDirectories(
                parentDir,
                parentEntries.filter(e => e !== 'src'),
                depth + 1,
                parentComponent
            )
        } catch (error) {
            console.warn(`⚠️  无法读取 src 目录: ${srcPath}`)
        }
    }

    /**
     * 查找目录中的组件文件
     */
    private _findComponentFiles(dirPath: string, entries: string[]): string[] {
        return entries.filter(entry => {
            const fullPath = join(dirPath, entry)
            if (!statSync(fullPath).isFile()) return false

            const ext = extname(entry).toLowerCase()
            return this.options.componentExtensions.includes(ext)
        })
    }

    /**
     * 处理组件文件
     */
    private _processComponentFiles(
        dirPath: string,
        componentFiles: string[],
        depth: number,
        parentComponent?: ComponentInfo,
        fromSrc: boolean = false
    ): ComponentInfo | undefined {
        let mainComponent: ComponentInfo | undefined

        componentFiles.forEach(fileName => {
            const nameWithoutExt = basename(fileName, extname(fileName))
            const pascalName = this._toPascalCase(nameWithoutExt)
            const mapKey = `${pascalName}`

            // 构建相对路径
            let relativeToComponents = relative(this.componentsDir, dirPath)
    /*        if (fromSrc) {
                // 如果来自 src 目录，去掉 src 部分
                relativeToComponents = relative(this.componentsDir, dirname(dirPath))
            }*/

            // 构建映射值路径
            const mapValue = `zhui-plus/packages/components/${relativeToComponents.replace(/\\/g, '/')}/${nameWithoutExt}`

            // 判断是否为主组件（与目录名相同的组件）
            const dirName = basename(dirname(dirPath))
            const isMainComponent = pascalName === this._toPascalCase(dirName) ||
                pascalName === this._toPascalCase(basename(relativeToComponents))

            const componentInfo: ComponentInfo = {
                rawName: nameWithoutExt,
                pascalName,
                mapKey,
                relativePath: relativeToComponents.replace(/\\/g, '/'),
                mapValue,
                isSubComponent: !!parentComponent || !isMainComponent,
                parentName: parentComponent?.pascalName,
                depth
            }

            // 避免重复添加
            if (!this.components.find(c => c.mapKey === mapKey)) {
                this.components.push(componentInfo)

                // 打印信息
                const indent = '  '.repeat(Math.min(depth, 3))
                const prefix = componentInfo.isSubComponent ? '└─ ' : '📦 '
                console.log(`${indent}${prefix}${mapKey} -> ${mapValue}`)
            }

            // 设置主组件（用于后续子组件关联）
            if (isMainComponent && !mainComponent) {
                mainComponent = componentInfo
            }
        })

        return mainComponent
    }

    /**
     * 扫描子目录
     */
    private _scanSubDirectories(
        parentDir: string,
        entries: string[],
        depth: number,
        parentComponent?: ComponentInfo
    ): void {
        entries.forEach(entry => {
            const fullPath = join(parentDir, entry)

            try {
                if (statSync(fullPath).isDirectory()) {
                    if (this.options.excludeDirs.includes(entry)) return
                    if (entry.startsWith('.') || entry.startsWith('_')) return

                    this._scanDirectory(fullPath, depth, parentComponent)
                }
            } catch (error) {
                // 跳过无法访问的文件/目录
            }
        })
    }

    /**
     * 转换为 PascalCase
     */
    private _toPascalCase(str: string): string {
        return str
            .split(/[-_.]+/)
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
    }
}

// ============= 代码生成器 =============
class ResolverGenerator {
    private components: ComponentInfo[]
    private prefix: string

    constructor(components: ComponentInfo[], prefix: string = 'Zh') {
        this.components = components
        this.prefix = prefix
    }

    /**
     * 生成 resolver 代码
     */
    generate(): string {
        const timestamp = new Date().toISOString()
        const mainComponents = this.components.filter(c => !c.isSubComponent)
        const subComponents = this.components.filter(c => c.isSubComponent)

        return `// ============================================
// 🤖 自动生成的 Resolver 配置
// ============================================
// 生成时间: ${timestamp}
// 主组件: ${mainComponents.length} 个
// 子组件: ${subComponents.length} 个
// 总计: ${this.components.length} 个
// ============================================
// ⚠️  警告：请勿手动修改此文件！
// 运行 'npm run generate-resolver' 重新生成
// ============================================

import type { ComponentResolver } from 'unplugin-vue-components/types'

// ===== 组件路径映射 =====
// 键名格式: ${this.prefix} + 组件驼峰名
// 值格式: zhui-plus/packages/components/相对路径/组件名
const COMPONENT_MAP: Record<string, string> = {
${this._generateMappings()}
}

// ===== 类型定义 =====
export interface ResolverOptions {
  /** 组件前缀，默认 '${this.prefix}' */
  prefix?: string
  /** 是否自动导入样式 */
  importStyle?: boolean
  /** 排除的组件列表 */
  exclude?: string[]
}

// ===== Resolver 实现 =====
export function ZhuiPlusResolver(
  options: ResolverOptions = {}
): ComponentResolver[] {
  const { 
    prefix = '${this.prefix}', 
    importStyle = true,
    exclude = [] 
  } = options
 // console.log('ZhuiPlusResolver====options', options)
  return [
    {
      type: 'component',
      resolve: (name: string) => {
          // console.log('ZhuiPlusResolver====name1',name, name.startsWith(prefix))
        // 检查前缀
        if (!name.startsWith(prefix)) return
        
        // 获取组件名（去掉前缀）
        const componentName = name.slice(prefix.length)
        
        // 检查是否在排除列表中
        if (exclude.includes(componentName)) return
        
        // 查找组件路径
        const from = COMPONENT_MAP[name]
        if (!from) return
        console.log('组件名称', componentName)
        console.log('组件路径', from)
        // 返回解析结果
        return {
          name: componentName,
          from
        }
      }
    }
  ]
}

// ===== 导出映射表 =====
export { COMPONENT_MAP }

// ===== 组件信息（用于文档和调试） =====
export const COMPONENT_INFO = {
  /** 所有组件列表 */
  all: [
${this.components.map(c => `    '${c.mapKey}'`).join(',\n')}
  ],
  /** 主组件列表 */
  main: [
${mainComponents.map(c => `    { name: '${c.mapKey}', path: '${c.mapValue}' }`).join(',\n')}
  ],
  /** 子组件列表 */
  sub: [
${subComponents.map(c => `    { name: '${c.mapKey}', path: '${c.mapValue}', parent: '${c.parentName}' }`).join(',\n')}
  ]
} as const

// ===== 组件树结构 =====
export const COMPONENT_TREE = {
${this._generateComponentTree()}
} as const
`
    }

    /**
     * 生成类型声明文件
     */
    generateTypes(): string {
        const timestamp = new Date().toISOString()

        const typeDeclarations = this.components
            .map(comp => {
                const comment = comp.isSubComponent
                    ? `  /** ${comp.pascalName} 子组件 (父组件: ${comp.parentName}) */`
                    : `  /** ${comp.pascalName} 组件 */`

                return `${comment}\n  ${comp.mapKey}: typeof import('zhui-plus')['${comp.pascalName}']`
            })
            .join('\n')

        return `// ============================================
// 🤖 自动生成的类型声明
// ============================================
// 生成时间: ${timestamp}
// ⚠️  警告：请勿手动修改此文件！
// ============================================

export {}

declare module 'vue' {
  export interface GlobalComponents {
${typeDeclarations}
  }
}
`
    }

    /**
     * 生成组件映射
     */
    private _generateMappings(): string {
        return this.components
            .map(comp => {
                const comment = comp.isSubComponent
                    ? `  // 子组件 (父组件: ${comp.parentName})`
                    : `  // 基础组件`

                return `${comment}\n  '${comp.mapKey}': '${comp.mapValue}'`
            })
            .join(',\n')
    }

    /**
     * 生成组件树
     */
    private _generateComponentTree(): string {
        const mainComponents = this.components.filter(c => !c.isSubComponent)

        return mainComponents
            .map(comp => {
                const children = this.components.filter(c => c.parentName === comp.pascalName)
                const childrenStr = children.length > 0
                    ? `\n      children: [${children.map(c => `'${c.mapKey}'`).join(', ')}]`
                    : ''

                return `  '${comp.mapKey}': {\n    path: '${comp.mapValue}'${childrenStr}\n  }`
            })
            .join(',\n')
    }
}

// ============= 主函数 =============
async function main(): Promise<void> {
    try {
        // 配置路径
        const packagesDir = resolve(__dirname, '../packages')
        const outputDir = resolve(__dirname, '../packages/resolver')

        console.log('🚀 组件 Resolver 自动生成器\n')
        console.log('配置信息:')
        console.log(`  前缀: Zh`)
        console.log(`  路径格式: zhui-plus/packages/components/...`)
        console.log('')

        // 检查 packages 目录是否存在
        if (!existsSync(packagesDir)) {
            throw new Error(`packages 目录不存在: ${packagesDir}`)
        }

        // 创建扫描器
        const scanner = new ComponentScanner({
            packagesDir,
            prefix: 'Zh',
            maxDepth: 5
        })

        // 扫描组件
        const components = scanner.scan()

        if (components.length === 0) {
            console.warn('\n⚠️  未找到任何组件')
            console.log('\n支持的目录结构示例:')
            console.log('  packages/components/button/src/button.vue')
            console.log('  packages/components/form/src/form.vue')
            console.log('  packages/components/form/src/form-item.vue')
            console.log('  packages/components/data/table/src/table.vue')
            console.log('  packages/components/data/table/src/table-column.vue')
            return
        }

        // 生成代码
        const generator = new ResolverGenerator(components, 'Zh')

        // 确保输出目录存在
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true })
            console.log(`\n📁 创建输出目录: ${outputDir}`)
        }

        // 生成 resolver
        const resolverCode = generator.generate()
        const resolverPath = join(outputDir, 'index.ts')
        writeFileSync(resolverPath, resolverCode, 'utf-8')
        console.log(`\n✅ Resolver 已生成: ${resolverPath}`)

        // 生成类型声明
        const typesCode = generator.generateTypes()
        const typesPath = resolve(__dirname, '../types/components.d.ts')
        writeFileSync(typesPath, typesCode, 'utf-8')
        console.log(`✅ 类型声明已生成: ${typesPath}`)

        // 打印统计信息
        const mainComponents = components.filter(c => !c.isSubComponent)
        const subComponents = components.filter(c => c.isSubComponent)

        console.log('\n📊 统计信息:')
        console.log(`  主组件: ${mainComponents.length} 个`)
        console.log(`  子组件: ${subComponents.length} 个`)
        console.log(`  总计: ${components.length} 个`)

        // 打印组件树
        console.log('\n📂 组件结构:')
        mainComponents.forEach(comp => {
            console.log(`  📦 ${comp.mapKey}`)
            console.log(`     路径: ${comp.mapValue}`)

            const children = subComponents.filter(c => c.parentName === comp.pascalName)
            children.forEach(child => {
                console.log(`    └─ ${child.mapKey}`)
                console.log(`       路径: ${child.mapValue}`)
            })
        })

        // 验证示例
        console.log('\n🔍 验证示例:')
        if (mainComponents.length > 0) {
            const example = mainComponents[0]
            console.log(`  COMPONENT_MAP['${example.mapKey}'] = '${example.mapValue}'`)
        }

        console.log('\n✨ 生成完成！')
    } catch (error) {
        console.error('\n❌ 生成失败:', error)
        throw error
    }
}

// ============= 执行 =============
main().catch((error) => {
    console.error('\n💥 脚本执行失败:', error)
    process.exit(1)
})
