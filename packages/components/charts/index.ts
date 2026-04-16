import zhBasechart from './src/zh-basechart.vue'
import ZhLinechart from './src/zh-linechart.vue'
import ZhBarchart from './src/zh-barchart.vue'
import ZhPiechart from './src/zh-piechart.vue'
import ZhMapchart from './src/zh-mapchart.vue'
import ZhPictorialBar from './src/zh-pictorialBar.vue'
import ZhLinebarchart from './src/zh-linebarchart.vue'

import {App} from 'vue'

export default {
    install(app: App) {
        app.component('zhBasechart', zhBasechart)
        app.component('ZhLinechart', ZhLinechart)
        app.component('ZhBarchart', ZhBarchart)
        app.component('ZhPiechart', ZhPiechart)
        app.component('ZhMapchart', ZhMapchart)
        app.component('ZhPictorialBar', ZhPictorialBar)
        app.component('ZhLinebarchart', ZhLinebarchart)
    }
}
export {
    zhBasechart,
    ZhLinechart,
    ZhBarchart,
    ZhPiechart,
    ZhMapchart,
    ZhPictorialBar,
    ZhLinebarchart
}
