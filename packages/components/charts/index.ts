import ZhBaseChart from './src/zh-baseChart.vue'
import ZhLineChart from './src/zh-lineChart.vue'
import ZhBarChart from './src/zh-barChart.vue'
import ZhPieChart from './src/zh-pieChart.vue'
import ZhMapChart from './src/zh-mapChart.vue'
import ZhPictorialBar from './src/zh-pictorialBar.vue'
import ZhLineBarChart from './src/zh-lineBarChart.vue'
import ZhScatterChart from './src/zh-scatterChart.vue'
import ZhRadarChart from './src/zh-radarChart.vue'
import ZhCircleChart from "./src/zh-circleChart.vue";
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
        app.component('ZhCircleChart', ZhCircleChart)
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
    ZhRadarChart,
    ZhCircleChart
}
