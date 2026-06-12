import { Widget } from './models/Widget';

/**
 * 生成 Vue SFC 源码
 */
export function generateVueCode(widgets: Widget[], componentName: string): string {
    const templateLines: string[] = [
        `<template>`,
        `  <div class="${componentName.toLowerCase()}-container" style="position:relative; width:1920px; height:1080px; background:#0f1923;">`
    ];

    for (const widget of widgets) {
        const styleStr = `position:absolute; left:${widget.style.left}px; top:${widget.style.top}px; width:${widget.style.width}px; height:${widget.style.height}px; opacity:${widget.style.opacity ?? 1}; transform:${widget.style.rotate ? `rotate(${widget.style.rotate}deg)` : 'none'};`;
        switch (widget.type) {
            case 'text':
                templateLines.push(
                    `    <div style="${styleStr}">`,
                    `      <span>{{ ${JSON.stringify(widget.props.text || '文本')} }}</span>`,
                    `    </div>`
                );
                break;
            case 'image':
                templateLines.push(
                    `    <img src="${widget.props.src || ''}" style="${styleStr}" alt="" />`
                );
                break;
            case 'border':
                templateLines.push(
                    `    <div style="${styleStr} border: 2px solid #4a90d9;"></div>`
                );
                break;
            default:
                templateLines.push(
                    `    <div style="${styleStr}">`,
                    `      <!-- 组件类型：${widget.type} -->`,
                    `    </div>`
                );
        }
    }

    templateLines.push(`  </div>`, `</template>`);

    const scriptLines: string[] = [
        ``,
        `<script setup lang="ts">`,
        `// 自动生成的大屏组件`,
        `</script>`,
        ``,
        `<style scoped>`,
        `.${componentName.toLowerCase()}-container {`,
        `  position: relative;`,
        `  overflow: hidden;`,
        `}`,
        `</style>`
    ];

    return templateLines.join('\n') + '\n' + scriptLines.join('\n');
}
