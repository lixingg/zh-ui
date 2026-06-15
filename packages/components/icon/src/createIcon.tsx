import { defineComponent } from 'vue'
import ZhIconBase from './zh-iconBase.vue'
import type { Component } from 'vue'

/**
 * 工厂函数：快速创建单个图标组件
 * @param name 图标名称 (对应 iconfont 中的类名后缀)
 * @returns 图标组件
 */
export function createIcon(name: string): Component {
    return defineComponent({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        inheritAttrs: false,
        setup(props, { attrs }) {
            return () => (
                <ZhIconBase
                    name={name}
            {...attrs}
            />
        )
        }
    })
}
