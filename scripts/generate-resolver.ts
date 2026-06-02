// scripts/generate-types.ts
import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { resolve, relative, basename, join, extname } from 'path'

const __dirname =resolve(process.cwd(), 'scripts')

// ============= 类型定义 =============
interface ComponentInfo {
    /** 文件名（不含扩展名） */
    fileName: string
    /** PascalCase 组件名 */
    pascalName: string
    /** 带前缀的标签名 */
    tagName: string
    /** 组件目录相对路径 */
    dirPath: string
    /** 组件入口文件路径 */
    entryPath: string
    /** 是否为子组件 */
    isSubComponent: boolean
    /** 父组件名 */
    parentName?: string
    /** Props 类型定义 */
    props?: PropInfo[]
    /** Events 类型定义 */
    events?: EventInfo[]
    /** Slots 类型定义 */
    slots?: SlotInfo[]
}

interface PropInfo {
    name: string
    type: string
    required: boolean
    default?: string
    description?: string
}

interface EventInfo {
    name: string
    params: string
    description?: string
}

interface SlotInfo {
    name: string
    description?: string
    params?: string
}

// ============= 组件扫描器 =============
class ComponentScanner {
    private componentsDir: string
    private components: ComponentInfo[] = []

    constructor(packagesDir: string) {
        this.componentsDir = resolve(packagesDir, 'components')
    }

    scan(): ComponentInfo[] {
        console.log('🔍 扫描组件目录...\n')
        this.components = []

        if (!existsSync(this.componentsDir)) {
            console.warn(`组件目录不存在: ${this.componentsDir}`)
            return []
        }

        this._scanDirectory(this.componentsDir, 0)

        // 排序
        this.components.sort((a, b) => {
            if (a.isSubComponent !== b.isSubComponent) return a.isSubComponent ? 1 : -1
            return a.pascalName.localeCompare(b.pascalName)
        })

        return this.components
    }

    private _scanDirectory(dirPath: string, depth: number, parentName?: string): void {
        try {
            const entries = readdirSync(dirPath)

            // 1. 检查是否有 src 目录
            if (entries.includes('src')) {
                this._processSrcDirectory(dirPath, depth, parentName)
                return
            }

            // 2. 查找组件文件
            const vueFiles = entries.filter(f => f.endsWith('.vue'))

            if (vueFiles.length > 0) {
                vueFiles.forEach(file => {
                    const componentInfo = this._createComponentInfo(dirPath, file, depth, parentName)
                    this.components.push(componentInfo)
                    console.log(`  ${'  '.repeat(depth)}📦 ${componentInfo.tagName}`)
                })

                // 扫描子目录
                entries.forEach(entry => {
                    const fullPath = join(dirPath, entry)
                    if (statSync(fullPath).isDirectory() && !entry.startsWith('.') && entry !== 'src') {
                        const componentName = this._toPascalCase(basename(fullPath))
                        this._scanDirectory(fullPath, depth + 1, componentName)
                    }
                })
            } else {
                // 3. 没有组件文件，继续扫描子目录
                entries.forEach(entry => {
                    const fullPath = join(dirPath, entry)
                    if (statSync(fullPath).isDirectory() && !entry.startsWith('.') && !entry.startsWith('_')) {
                        this._scanDirectory(fullPath, depth, parentName)
                    }
                })
            }
        } catch (error) {
            console.warn(`无法读取目录: ${dirPath}`)
        }
    }

    private _processSrcDirectory(dirPath: string, depth: number, parentName?: string): void {
        const srcPath = join(dirPath, 'src')

        try {
            const srcEntries = readdirSync(srcPath)
            const vueFiles = srcEntries.filter(f => f.endsWith('.vue'))

            vueFiles.forEach(file => {
                const componentInfo = this._createComponentInfo(srcPath, file, depth, parentName)
                this.components.push(componentInfo)
                console.log(`  ${'  '.repeat(depth)}📦 ${componentInfo.tagName}`)
            })

            // 扫描 src 下的子目录
            srcEntries.forEach(entry => {
                const fullPath = join(srcPath, entry)
                if (statSync(fullPath).isDirectory() && !entry.startsWith('.')) {
                    const componentName = this._toPascalCase(entry)
                    this._scanDirectory(fullPath, depth + 1, componentName)
                }
            })
        } catch (error) {
            console.warn(`无法读取 src 目录: ${srcPath}`)
        }
    }

    private _createComponentInfo(
        dirPath: string,
        fileName: string,
        depth: number,
        parentName?: string
    ): ComponentInfo {
        const fileNameWithoutExt = basename(fileName, extname(fileName))
        const pascalName = this._toPascalCase(fileNameWithoutExt)
        const tagName = `${pascalName}`

        const relativeDir = relative(this.componentsDir, dirPath)
        const entryPath = join(relativeDir, fileName).replace(/\\/g, '/')

        // 解析 props 和 events
        const filePath = join(dirPath, fileName)
        const props = this._parseProps(filePath)
        const events = this._parseEvents(filePath)
        const slots = this._parseSlots(filePath)

        return {
            fileName: fileNameWithoutExt,
            pascalName,
            tagName,
            dirPath: relativeDir,
            entryPath,
            isSubComponent: !!parentName,
            parentName,
            props,
            events,
            slots
        }
    }

    private _parseProps(filePath: string): PropInfo[] {
        try {
            if (!existsSync(filePath)) return []

            const content = readFileSync(filePath, 'utf-8')
            const props: PropInfo[] = []

            // 解析 defineProps
            const propsMatch = content.match(/defineProps\s*\(\s*\{([^}]+)\}\s*\)/)
            if (propsMatch) {
                const propsContent = propsMatch[1]
                const propLines = propsContent.split('\n')

                propLines.forEach(line => {
                    const nameMatch = line.match(/(\w+)\s*:\s*\{/)
                    if (nameMatch) {
                        const name = nameMatch[1]
                        const typeMatch = line.match(/type\s*:\s*(\w+)/)
                        const requiredMatch = line.match(/required\s*:\s*true/)
                        const defaultMatch = line.match(/default\s*:\s*(.+)/)

                        props.push({
                            name,
                            type: typeMatch ? typeMatch[1] : 'any',
                            required: !!requiredMatch,
                            default: defaultMatch ? defaultMatch[1].trim() : undefined
                        })
                    }
                })
            }

            return props
        } catch {
            return []
        }
    }

    private _parseEvents(filePath: string): EventInfo[] {
        try {
            if (!existsSync(filePath)) return []

            const content = readFileSync(filePath, 'utf-8')
            const events: EventInfo[] = []

            // 解析 defineEmits
            const emitsMatch = content.match(/defineEmits\s*\(\s*\[([^\]]+)\]\s*\)/)
            if (emitsMatch) {
                const emitsContent = emitsMatch[1]
                const emitNames = emitsContent.match(/'([^']+)'/g)

                if (emitNames) {
                    emitNames.forEach(name => {
                        events.push({
                            name: name.replace(/'/g, ''),
                            params: '...args: any[]'
                        })
                    })
                }
            }

            // 解析 emits 选项
            const emitsOptionMatch = content.match(/emits\s*:\s*\{([^}]+)\}/)
            if (emitsOptionMatch) {
                const emitsContent = emitsOptionMatch[1]
                const emitLines = emitsContent.split('\n')

                emitLines.forEach(line => {
                    const nameMatch = line.match(/(\w+)\s*:/)
                    if (nameMatch) {
                        events.push({
                            name: nameMatch[1],
                            params: '...args: any[]'
                        })
                    }
                })
            }

            return events
        } catch {
            return []
        }
    }

    private _parseSlots(filePath: string): SlotInfo[] {
        try {
            if (!existsSync(filePath)) return []

            const content = readFileSync(filePath, 'utf-8')
            const slots: SlotInfo[] = []

            // 解析 <slot> 标签
            const slotRegex = /<slot\s+name="([^"]+)"[^>]*>/g
            let match

            while ((match = slotRegex.exec(content)) !== null) {
                slots.push({
                    name: match[1]
                })
            }

            // 检查是否有默认插槽
            if (content.includes('<slot') && !content.includes('name=')) {
                slots.unshift({
                    name: 'default',
                    description: '默认插槽'
                })
            }

            return slots
        } catch {
            return []
        }
    }

    private _toPascalCase(str: string): string {
        return str
            .split(/[-_.]/)
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
    }
}

// ============= 类型文件生成器 =============
class TypesGenerator {
    private components: ComponentInfo[]
    private prefix: string

    constructor(components: ComponentInfo[], prefix: string = 'Zh') {
        this.components = components
        this.prefix = prefix
    }

    generateGlobalTypes(): string {
        const timestamp = new Date().toISOString()
        const mainComponents = this.components.filter(c => !c.isSubComponent)
        const subComponents = this.components.filter(c => c.isSubComponent)

        return `// ============================================
// 🤖 自动生成的全局类型声明
// 生成时间: ${timestamp}
// 组件数量: ${this.components.length}
// ============================================

import type { Component } from 'vue'

declare module 'vue' {
  export interface GlobalComponents {
${this._generateGlobalComponentDeclarations(mainComponents, subComponents)}
  }
}

// ===== 组件实例类型 =====
${this._generateComponentInstanceTypes()}

// ===== 组件 Props 类型 =====
${this._generatePropsTypes()}

// ===== 组件 Events 类型 =====
${this._generateEventsTypes()}

export {}
`
    }

    generateComponentTypes(): string {
        const timestamp = new Date().toISOString()

        return `// ============================================
// 🤖 自动生成的组件类型声明
// 生成时间: ${timestamp}
// ============================================

import type { Component, ComponentPublicInstance } from 'vue'

${this.components.map(comp => this._generateComponentType(comp)).join('\n\n')}

// ===== 组件映射类型 =====
export interface ZhuiPlusComponents {
${this.components.map(comp => `  '${comp.tagName}': typeof ${comp.pascalName}`).join('\n')}
}

// ===== 全局类型扩展 =====
declare module '@vue/runtime-core' {
  export interface GlobalComponents extends ZhuiPlusComponents {}
}
`
    }

    generateResolverTypes(): string {
        return `// ============================================
// 🤖 Resolver 类型声明
// ============================================

import type { ComponentResolver } from 'unplugin-vue-components/types'

declare const COMPONENT_MAP: Record<string, string>

export interface ResolverOptions {
  /** 组件前缀，默认 '${this.prefix}' */
  prefix?: string
  /** 是否自动导入样式 */
  importStyle?: boolean
  /** 排除的组件列表 */
  exclude?: string[]
}

export declare function ZhuiPlusResolver(
  options?: ResolverOptions
): ComponentResolver[]

export { COMPONENT_MAP }
`
    }

    private _generateGlobalComponentDeclarations(
        mainComponents: ComponentInfo[],
        subComponents: ComponentInfo[]
    ): string {
        const declarations: string[] = []

        mainComponents.forEach(comp => {
            const propsType = comp.props && comp.props.length > 0 ? comp.pascalName + 'Props' : '{}'
            const eventsType = comp.events && comp.events.length > 0 ? comp.pascalName + 'Events' : '{}'

            declarations.push(`    /** ${comp.pascalName} 组件 */`)
            declarations.push(`    ${comp.tagName}: new (...args: any[]) => InstanceType<typeof ${comp.pascalName}>`)
        })

        subComponents.forEach(comp => {
            declarations.push(`    /** ${comp.pascalName} 子组件 (父组件: ${comp.parentName}) */`)
            declarations.push(`    ${comp.tagName}: new (...args: any[]) => InstanceType<typeof ${comp.pascalName}>`)
        })

        return declarations.join('\n')
    }

    private _generateComponentInstanceTypes(): string {
        return this.components.map(comp => {
            return `export interface ${comp.pascalName}Instance {
  $el: HTMLElement
  $props: ${comp.pascalName}Props
  $emit: ${comp.pascalName}Events
}`
        }).join('\n\n')
    }

    private _generatePropsTypes(): string {
        return this.components
            .filter(comp => comp.props && comp.props.length > 0)
            .map(comp => {
                const props = comp.props!.map(p => {
                    const optional = p.required ? '' : '?'
                    const desc = p.description ? `  /** ${p.description} */\n` : ''
                    const defaultVal = p.default ? `  /** @default ${p.default} */\n` : ''
                    return `${desc}${defaultVal}  ${p.name}${optional}: ${this._convertType(p.type)}`
                })

                return `export interface ${comp.pascalName}Props {
${props.join('\n')}
}`
            })
            .join('\n\n')
    }

    private _generateEventsTypes(): string {
        return this.components
            .filter(comp => comp.events && comp.events.length > 0)
            .map(comp => {
                const events = comp.events!.map(e => {
                    return `  (event: '${e.name}', ...args: any[]): void`
                })

                return `export interface ${comp.pascalName}Events {
${events.join('\n')}
}`
            })
            .join('\n\n')
    }

    private _generateComponentType(comp: ComponentInfo): string {
        const propsType = comp.props && comp.props.length > 0 ? comp.pascalName + 'Props' : '{}'
        const eventsType = comp.events && comp.events.length > 0 ? comp.pascalName + 'Events' : '{}'

        return `/** ${comp.pascalName} 组件 */
export declare const ${comp.pascalName}: new () => {
  $props: ${propsType}
  $emit: ${eventsType}
}`
    }

    private _convertType(type: string): string {
        const typeMap: Record<string, string> = {
            'String': 'string',
            'Number': 'number',
            'Boolean': 'boolean',
            'Array': 'any[]',
            'Object': 'Record<string, any>',
            'Function': '(...args: any[]) => any',
            'Date': 'Date',
            'RegExp': 'RegExp'
        }
        return typeMap[type] || type.toLowerCase()
    }
}

// ============= 主函数 =============
async function main() {
    try {
        const packagesDir = resolve(__dirname, '../packages')
        const outputDir = resolve(__dirname, '../types')

        console.log('🚀 开始生成 TypeScript 类型文件...\n')

        // 扫描组件
        const scanner = new ComponentScanner(packagesDir)
        const components = scanner.scan()

        if (components.length === 0) {
            console.warn('⚠️  未找到任何组件')
            return
        }

        // 生成类型
        const generator = new TypesGenerator(components, 'Zh')

        // 确保输出目录存在
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true })
        }

        // 1. 生成全局类型声明
        const globalTypes = generator.generateGlobalTypes()
        const globalTypesPath = resolve(__dirname, '../ZHUI/global.d.ts')
        writeFileSync(globalTypesPath, globalTypes, 'utf-8')
        console.log(`✅ 全局类型: ${globalTypesPath}`)

        // 2. 生成组件类型声明
        const componentTypes = generator.generateComponentTypes()
        const componentTypesPath = join(outputDir, 'components.d.ts')
        writeFileSync(componentTypesPath, componentTypes, 'utf-8')
        console.log(`✅ 组件类型: ${componentTypesPath}`)

        // 3. 生成 Resolver 类型声明
        const resolverTypes = generator.generateResolverTypes()
        const resolverTypesPath = join(outputDir, 'resolver.d.ts')
        writeFileSync(resolverTypesPath, resolverTypes, 'utf-8')
        console.log(`✅ Resolver 类型: ${resolverTypesPath}`)

        // 打印统计
        const mainCount = components.filter(c => !c.isSubComponent).length
        const subCount = components.filter(c => c.isSubComponent).length

        console.log(`\n📊 统计:`)
        console.log(`  主组件: ${mainCount} 个`)
        console.log(`  子组件: ${subCount} 个`)
        console.log(`  总计: ${components.length} 个`)
        console.log(`\n✨ 类型文件生成完成！`)

    } catch (error) {
        console.error('❌ 生成失败:', error)
        throw error
    }
}

main().catch(console.error)
