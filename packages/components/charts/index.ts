import ZhBaseChart from './src/zh-basechart.vue'
import ZhLineChart from './src/zh-linechart.vue'
import ZhBarChart from './src/zh-barchart.vue'
import ZhPieChart from './src/zh-piechart.vue'
import ZhMapChart from './src/zh-mapchart.vue'
import ZhPictorialBar from './src/zh-pictorialBar.vue'
import ZhLineBarChart from './src/zh-linebarchart.vue'
import ZhScatterChart from './src/zh-scatterchart.vue'
import ZhRadarChart from './src/zh-radarchart.vue'
import {App} from 'vue'

export default {
    install(app: App) {
        app.component('ZhBaseChart', ZhBaseChart)
        app.component('ZhLineChart', ZhLineChart)
        app.component('ZhBarChart', ZhBarChart)
        app.component('ZhPieChart', ZhPieChart)
        app.component('ZhMapChart', ZhMapChart)
        app.component('ZhPictorialBar', ZhPictorialBar)
        app.component('ZhLineBarChart', ZhLineBarChart)
        app.component('ZhScatterChart', ZhScatterChart)
        app.component('ZhRadarChart', ZhRadarChart)
    }
}
export {
    ZhBaseChart,
    ZhLineChart,
    ZhBarChart,
    ZhPieChart,
    ZhMapChart,
    ZhPictorialBar,
    ZhLineBarChart,
    ZhScatterChart,
    ZhRadarChart
}
