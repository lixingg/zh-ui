<!-- components/MapChart.vue -->
<template>
  <zh-basechart
      :chart-id="chartId"
      :custom-option="mergedOption"
      :chart-data="chartData"
      :height="height"
      :width="width"
      @chartClick="handleClick"
  />
</template>

<script setup lang="ts">
import {computed, onMounted, defineProps, defineEmits} from 'vue'
import type {EChartsOption} from 'echarts/types/dist/shared'
import * as echarts from 'echarts'

// 注意：需要先注册地图 GeoJSON 数据
import chinaGeoJson from '../geo.json'
import {json} from "stream/consumers";

const props = defineProps({
  chartId: {type: String, default: 'map-chart'},
  mapName: {type: String, default: 'china'},
  data: {type: Array as () => { name: string; value: number }[], required: true},
  height: {type: String, default: '500px'},
  width: {type: String, default: '100%'},
  background:{type: String, default:'#013954'},
  customOption: {type: Object as () => Partial<EChartsOption>, default: () => ({})},
  geoJson: {type: Object, default: chinaGeoJson},
  points: {type: Array as () => { value: []; itemStyle: Object }[], required: true},
})

const emit = defineEmits(['chartClick'])

echarts.registerMap('china', props.geoJson)
const chartData = computed(() => props.data)

const mergedOption = computed(() => {
  return {
    backgroundColor: props.background,
    geo: {
      map: 'china',
      aspectScale: 0.75, //长宽比
      zoom: 1.1,
      roam: false,
      itemStyle: {
        areaColor: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.8,
          colorStops: [{
            offset: 0,
            color: '#09132c' // 0% 处的颜色
          }, {
            offset: 1,
            color: '#274d68'  // 100% 处的颜色
          }],
          globalCoord: true // 缺省为 false
        },
        shadowColor: 'rgb(58,115,192)',
        shadowOffsetX: 10,
        shadowOffsetY: 11,
        emphasis: {
          areaColor: '#2AB8FF',
          borderWidth: 0,
          color: 'green',
          label: {
            show: false
          }
        }
      },
      regions: [{
        name: '南海诸岛',
        itemStyle: {
          areaColor: 'rgba(0, 10, 52, 1)',

          borderColor: 'rgba(0, 10, 52, 1)',
          normal: {
            opacity: 0,
            label: {
              show: false,
              color: "#009cc9",
            }
          }
        },


      }],
    },
    series: [{
      name: '地图',
      type: 'map',
      zoom: 1.1,
      map: props.mapName,
      roam: false,
      data: props.data,
      label: {
        show: true,
        color: '#1DE9B6',
        emphasis: {
          color: 'rgb(183,185,14)'
        }
      },

      itemStyle: {
        borderColor: 'rgb(147, 235, 248)',
        borderWidth: 1,
        areaColor: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.8,
          colorStops: [{
            offset: 0,
            color: '#09132c' // 0% 处的颜色
          }, {
            offset: 1,
            color: '#274d68'  // 100% 处的颜色
          }],
          globalCoord: true // 缺省为 false
        },
        emphasis: {
          areaColor: 'rgb(46,229,206)',
          //    shadowColor: 'rgb(12,25,50)',
          borderWidth: 0.1
        }
      },
    },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        showEffectOn: 'render',
        zlevel: 1,
        rippleEffect: {
          period: 15,
          scale: 4,
          brushType: 'fill'
        },
        hoverAnimation: true,
        label: {
          formatter: '{b}',
          position: 'right',
          offset: [15, 0],
          color: '#1DE9B6',
          show: true
        },
        itemStyle: {
          color: '#1DE9B6'/* function (value){ //随机颜色
 return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6);
 }*/,
          shadowBlur: 10,
          shadowColor: '#333'
        },
        symbolSize: 12,
        data: props.points
      },
      {
        type: 'lines',
        zlevel: 2,
        effect: {
          show: true,
          period: 4, //箭头指向速度，值越小速度越快
          trailLength: 0.4, //特效尾迹长度[0,1]值越大，尾迹越长重
          symbol: 'arrow', //箭头图标
          symbolSize: 7, //图标大小
        },
        lineStyle: {
          color: '#1DE9B6'
          /* function (value){ //随机颜色

          ['#f21347','#f3243e','#f33736','#f34131','#f34e2b',
          '#f56321','#f56f1c','#f58414','#f58f0e','#f5a305',
          '#e7ab0b','#dfae10','#d5b314','#c1bb1f','#b9be23',
          '#a6c62c','#96cc34','#89d23b','#7ed741','#77d64c',
          '#71d162','#6bcc75','#65c78b','#5fc2a0','#5abead',
          '#52b9c7','#4fb6d2','#4ab2e5']
return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6);
}*/,
          width: 1, //线条宽度
          opacity: 0.1, //尾迹线条透明度
          curveness: .3 //尾迹线条曲直度
        },
        data: [
          {coords: [[118.8062, 31.9208], [119.4543, 25.9222]], lineStyle: {color: '#4ab2e5'}}
          , {coords: [[127.9688, 45.368], [119.4543, 25.9222]], lineStyle: {color: '#4fb6d2'}}
          , {coords: [[110.3467, 41.4899], [119.4543, 25.9222]], lineStyle: {color: '#52b9c7'}}
          , {coords: [[125.8154, 44.2584], [119.4543, 25.9222]], lineStyle: {color: '#5abead'}}
          , {coords: [[116.4551, 40.2539], [119.4543, 25.9222]], lineStyle: {color: '#f34e2b'}}
          , {coords: [[123.1238, 42.1216], [119.4543, 25.9222]], lineStyle: {color: '#f56321'}}
          , {coords: [[114.4995, 38.1006], [119.4543, 25.9222]], lineStyle: {color: '#f56f1c'}}
          , {coords: [[117.4219, 39.4189], [119.4543, 25.9222]], lineStyle: {color: '#f58414'}}
          , {coords: [[112.3352, 37.9413], [119.4543, 25.9222]], lineStyle: {color: '#f58f0e'}}
          , {coords: [[109.1162, 34.2004], [119.4543, 25.9222]], lineStyle: {color: '#f5a305'}}
          , {coords: [[103.5901, 36.3043], [119.4543, 25.9222]], lineStyle: {color: '#e7ab0b'}}
          , {coords: [[106.3586, 38.1775], [119.4543, 25.9222]], lineStyle: {color: '#dfae10'}}
          , {coords: [[101.4038, 36.8207], [119.4543, 25.9222]], lineStyle: {color: '#d5b314'}}
          , {coords: [[103.9526, 30.7617], [119.4543, 25.9222]], lineStyle: {color: '#c1bb1f'}}
          , {coords: [[108.384366, 30.439702], [119.4543, 25.9222]], lineStyle: {color: '#b9be23'}}
          , {coords: [[113.0823, 28.2568], [119.4543, 25.9222]], lineStyle: {color: '#a6c62c'}}
          , {coords: [[102.9199, 25.46639], [119.4543, 25.9222]], lineStyle: {color: '#96cc34'}}
        ]
      }],
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>{c}'
    },
    ...props.customOption
  }
})

const handleClick = (params: any) => emit('chartClick', params)
</script>
