// scripts/generate-global-dts.ts
import { readdirSync, writeFileSync, existsSync, statSync } from 'fs';
import { resolve, join, relative, basename, extname } from 'path';

// ===== 配置（按需修改） =====
const COMPONENTS_SRC_DIR = resolve(process.cwd(), 'packages/components');
const OUTPUT_FILE = resolve(process.cwd(), 'types/components.d.ts');          // 生成的声明文件
const DIST_ENTRY = '../dist/components/index.js';                    // 打包后的组件入口（相对输出文件）
const DIST_TYPES_ENTRY = '../dist/components/index.d.ts';           // 打包后的类型入口
const COMPONENT_PREFIX = '';                                       // 组件前缀
const PACKAGE_DEFAULT_EXPORT_NAME = 'ZhuiPlus';                      // 默认导出名

// ==========================================

function toPascalCase(str: string): string {
    return str
        .split(/[-_]/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

// 递归扫描组件，返回 PascalCase 名称列表
function scanComponents(dir: string): string[] {
    if (!existsSync(dir)) return [];

    const result: string[] = [];
    const entries = readdirSync(dir);

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        if (!statSync(fullPath).isDirectory() || entry.startsWith('.') || entry.startsWith('_')) continue;

        // 1. 检查 src 子目录
        const srcDir = join(fullPath, 'src');
        if (existsSync(srcDir)) {
            const srcFiles = readdirSync(srcDir).filter(f => f.endsWith('.vue'));
            for (const file of srcFiles) {
                const name = basename(file, '.vue');
                result.push(toPascalCase(name));
            }
            // 继续扫描 src 下的子目录（可能是子组件）
            const subDirs = readdirSync(srcDir).filter(f => statSync(join(srcDir, f)).isDirectory());
            for (const sub of subDirs) {
                const subFullPath = join(srcDir, sub);
                const subFiles = readdirSync(subFullPath).filter(f => f.endsWith('.vue'));
                for (const file of subFiles) {
                    const name = basename(file, '.vue');
                    result.push(toPascalCase(name));
                }
            }
        } else {
            // 2. 没有 src 目录，直接检查当前目录下的 .vue 文件
            const vueFiles = entries.filter(f => f.endsWith('.vue'));
            if (vueFiles.length > 0) {
                for (const file of vueFiles) {
                    const name = basename(file, '.vue');
                    result.push(toPascalCase(name));
                }
                continue; // 是组件目录，不再深入
            }
            // 3. 可能是分组目录，递归扫描
            const subComponents = scanComponents(fullPath);
            result.push(...subComponents);
        }
    }

    // 去重
    return [...new Set(result)];
}

function generateDts(componentNames: string[]): string {
    const globalComponentsLines = componentNames
        .map(name => ` ${COMPONENT_PREFIX}${name}: typeof import('${DIST_TYPES_ENTRY}')['${name}']`)
        .join('\n');

    return `// ============================================
// 🤖 自动生成的全局类型声明
// 生成时间: ${new Date().toISOString()}
// ============================================

import type { Component, ComponentPublicInstance } from 'vue'

export * from '${DIST_ENTRY}'
export {}

import ${PACKAGE_DEFAULT_EXPORT_NAME} from '${DIST_ENTRY}'
export default ${PACKAGE_DEFAULT_EXPORT_NAME}

// ===== 全局类型扩展 =====

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
${globalComponentsLines}
  }
}

export {}
`;
}

function main() {
    console.log('🔍 扫描组件目录:', COMPONENTS_SRC_DIR);
    const componentNames = scanComponents(COMPONENTS_SRC_DIR);
    console.log(`✅ 找到 ${componentNames.length} 个组件:`);
    componentNames.forEach(name => console.log(`  - ${COMPONENT_PREFIX}${name}`));

    const code = generateDts(componentNames);
    writeFileSync(OUTPUT_FILE, code, 'utf-8');
    console.log(`\n📝 已生成文件: ${OUTPUT_FILE}`);
}

main();
