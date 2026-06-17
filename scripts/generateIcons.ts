import fs from 'fs'
import path from 'path'

const PROJECT_ROOT = process.cwd()
const CSS_PATH = path.resolve(PROJECT_ROOT, 'packages/styles/iconfont/iconfont-normal.css')
const CSS_PATH1 = path.resolve(PROJECT_ROOT, 'packages/styles/iconfont-c/iconfont-normal.css')
const ICONS_OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'packages/components/icon/src/icons')

// 确保输出目录存在
if (!fs.existsSync(ICONS_OUTPUT_DIR)) {
    fs.mkdirSync(ICONS_OUTPUT_DIR, { recursive: true })
}

// 读取 CSS 文件
const cssContent = fs.readFileSync(CSS_PATH, 'utf-8')
const cssContent1 = fs.readFileSync(CSS_PATH1, 'utf-8')

// 匹配 .icon-xxx:before 规则（兼容换行）
const iconRegex = /\.icon-([a-zA-Z0-9_-]+)\s*:before\s*\{/g
const iconNames: string[] = []
const iconNames1: string[] = []
let match: RegExpExecArray | null

while ((match = iconRegex.exec(cssContent)) !== null) {
    iconNames.push(match[1])
}

while ((match = iconRegex.exec(cssContent1)) !== null) {
    iconNames1.push(match[1])
}

if (iconNames.length === 0) {
    throw new Error('未在 iconfont-normal.css 中找到任何 .icon-xxx:before 规则')
}
if (iconNames1.length === 0) {
    throw new Error('未在 iconfont-normal.css 中找到任何 .icon-xxx:before 规则')
}
console.log(`发现 ${iconNames.length} 个普通图标:`, iconNames)
console.log(`发现 ${iconNames1.length} 个彩色图标:`, iconNames1)

// 工具函数：首字母大写
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

// 将横线/下划线命名转为 PascalCase（例如 video-fill → VideoFill）
const toPascalCase = (str: string) =>
    str.split(/[-_]/).map(part => capitalize(part)).join('')

// 生成 index.ts 内容
const exportStatements = iconNames.map(name => {
    const componentName = toPascalCase(name)
    return `export const ${componentName} = createIcon('${name}')`
}).join('\n')
const exportStatements1 = iconNames1.map(name => {
    const componentName = toPascalCase(name)
    return `export const ${componentName} = createIcon('${name}')`
}).join('\n')

const indexContent2 = `// 本文件由 scripts/generateIcons.ts 自动生成，请勿手动修改
import { createIcon } from '../createIcon'
${exportStatements}
`
const indexContent1 = `// 本文件由 scripts/generateIcons.ts 自动生成，请勿手动修改
import { createIcon } from '../createIcon'

${exportStatements1}
`
const indexContent = `// 本文件由 scripts/generateIcons.ts 自动生成，请勿手动修改
export * from './ordinary'
export * from './special'
`
// 写入 index.ts
const indexPath = path.join(ICONS_OUTPUT_DIR, 'index.ts')
fs.writeFileSync(indexPath, indexContent, 'utf-8')
console.log(`生成 ${indexPath} 完成`)
// 写入 ordinary.ts
const indexPath2 = path.join(ICONS_OUTPUT_DIR, 'ordinary.ts')
fs.writeFileSync(indexPath2, indexContent2, 'utf-8')
console.log(`生成 ${indexPath2} 完成`)
// 写入 special.ts
const indexPath1 = path.join(ICONS_OUTPUT_DIR, 'special.ts')
fs.writeFileSync(indexPath1, indexContent1, 'utf-8')
console.log(`生成 ${indexPath1} 完成`)

// 可选：删除之前生成的独立 .ts 文件（如果有）
const files = fs.readdirSync(ICONS_OUTPUT_DIR)
for (const file of files) {
    if (file !== 'index.ts'  && file !== 'special.ts'  && file !== 'ordinary.ts' && file.endsWith('.ts')) {
        fs.unlinkSync(path.join(ICONS_OUTPUT_DIR, file))
        console.log(`删除旧文件: ${file}`)
    }
/*    if (file !== 'index1.ts' && file.endsWith('.ts')) {
        fs.unlinkSync(path.join(ICONS_OUTPUT_DIR, file))
        console.log(`删除旧文件: ${file}`)
    }*/
}

