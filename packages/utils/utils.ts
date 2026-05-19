// utils/echartsTheme.ts
import type { EChartsOption} from 'echarts/types/dist/shared'
import * as echarts from 'echarts';

// 马卡龙风格主题配置[reference:7]
export const macaronsTheme: any = {
    color: [
        '#F7B6D2', // 樱花粉
        '#A8E6CF', // 薄荷绿
        '#FFD3B6', // 奶油橘
        '#D4A5E6', // 薰衣草紫
        '#B5EAD7', // 浅海绿
        '#FFC8A2', // 蜜桃色
        '#C7CEE6', // 淡蓝灰
        '#E2F0CB', // 嫩芽绿
        '#FEC8D8', // 淡玫瑰
        '#C4E0D9'  // 雾霾蓝
    ],
    backgroundColor: '#FFFFFF',
    textStyle: {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: 12,
        color: '#333333'
    },
    title: {
        textStyle: { color: '#333333', fontSize: 16, fontWeight: 'normal' }
    },
    line: {
        itemStyle: { borderWidth: 2 },
        lineStyle: { width: 3 },
        symbolSize: 6,
        smooth: true
    },
    bar: {
        itemStyle: {
            borderRadius: [4, 4, 0, 0]
        }
    },
    categoryAxis: {
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
    },
    valueAxis: {
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F0F0F0', type: 'dashed' } }
    },
    grid: {
        containLabel: true,
        left: '3%',
        right: '4%',
        bottom: '10%'
    },
    tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E8E8E8',
        borderWidth: 1,
        textStyle: { color: '#333333' }
    }
}

// 生成从上往下的线性渐变（带透明度遮幕效果）[reference:8][reference:9]
// @ts-ignore
export function generateLinearGradient(
    chartInstance: any,
    color: string,
    startOpacity: number = 0.4,
    endOpacity: number = 0.05
) {
    return {
        type: 'linear',
        x: 0,   // 起始 x 坐标（0 表示最左）
        y: 0,   // 起始 y 坐标（0 表示最上）
        x2: 0,  // 结束 x 坐标（0 表示保持水平不变）
        y2: 1,  // 结束 y 坐标（1 表示最下）—— 实现从上往下渐变[reference:10]
        colorStops: [
            { offset: 0, color: `${color}${Math.round(startOpacity * 255).toString(16).padStart(2, '0')}` },
            { offset: 1, color: `${color}${Math.round(endOpacity * 255).toString(16).padStart(2, '0')}` }
        ]
    }
}

// 生成马卡龙色板（根据索引获取颜色）
export function getMacaronColor(index: number): string {
    const colors = [
        '#F7B6D2', '#A8E6CF', '#FFD3B6', '#D4A5E6',
        '#B5EAD7', '#FFC8A2', '#C7CEE6', '#E2F0CB'
    ]
    return colors[index % colors.length]
}

/**
 * 动态加载 JavaScript
 */
export function loadScript(src: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // 避免重复加载
        if (id && document.getElementById(id)) return resolve()
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) {
            existing.addEventListener('load', () => resolve())
            existing.addEventListener('error', () => reject(new Error(`脚本加载失败: ${src}`)))
            return
        }
        const script = document.createElement('script')
        script.src = src
        script.async = false            // 保证执行顺序
        if (id) script.id = id
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`脚本加载失败: ${src}`))
        document.head.appendChild(script)
    })
}

/**
 * 动态加载 CSS
 */
export function loadCSS(href: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (id && document.getElementById(id)) return resolve()
        const existing = document.querySelector(`link[href="${href}"]`)
        if (existing) {
            // 样式加载不易监听，直接认为成功
            resolve()
            return
        }
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        if (id) link.id = id
        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`样式加载失败: ${href}`))
        document.head.appendChild(link)
    })
}
