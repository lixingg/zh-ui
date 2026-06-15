import fs from 'fs'
import path from 'path'

const PROJECT_ROOT = process.cwd()
const CSS_PATH = path.resolve(PROJECT_ROOT, 'packages/styles/iconfont/iconfont.css')
const ICONS_OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'packages/components/icon/src/icons')

// 确保输出目录存在
if (!fs.existsSync(ICONS_OUTPUT_DIR)) {
    fs.mkdirSync(ICONS_OUTPUT_DIR, { recursive: true })
}

// 读取 CSS 文件
const cssContent = fs.readFileSync(CSS_PATH, 'utf-8')

// 匹配 .icon-xxx:before 规则（兼容换行）
const iconRegex = /\.icon-([a-zA-Z0-9_-]+)\s*:before\s*\{/g
const iconNames: string[] = []
let match: RegExpExecArray | null

while ((match = iconRegex.exec(cssContent)) !== null) {
    iconNames.push(match[1])
}

if (iconNames.length === 0) {
    throw new Error('未在 iconfont.css 中找到任何 .icon-xxx:before 规则')
}

console.log(`发现 ${iconNames.length} 个图标:`, iconNames)

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

const indexContent = `// 本文件由 scripts/generateIcons.ts 自动生成，请勿手动修改
import { createIcon } from '../createIcon'

${exportStatements}
`

// 写入 index.ts
const indexPath = path.join(ICONS_OUTPUT_DIR, 'index.ts')
fs.writeFileSync(indexPath, indexContent, 'utf-8')
console.log(`生成 ${indexPath} 完成`)

// 可选：删除之前生成的独立 .ts 文件（如果有）
const files = fs.readdirSync(ICONS_OUTPUT_DIR)
for (const file of files) {
    if (file !== 'index.ts' && file.endsWith('.ts')) {
        fs.unlinkSync(path.join(ICONS_OUTPUT_DIR, file))
        console.log(`删除旧文件: ${file}`)
    }
}
