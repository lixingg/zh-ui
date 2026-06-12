<script setup> 
import baseMediaSwiper from './baseMediaSwiper.vue';
</script>

# mediaSwiper 媒体轮播

## 基础用法

<show-code showPath="mediaSwiper/baseMediaSwiper">
<baseMediaSwiper></baseMediaSwiper>
</show-code>

## mediaSwiper 属性

| 属性       | 说明                                          | 类型                   | 默认值     |
|----------|---------------------------------------------|----------------------|---------|
| list     | 需要展示媒体链接数组，图片类型和视频类型链接混和在一个数组中（使用这个不使用下面两个） | `string[]`           | ''      |
| videos   | 需要展示媒体视频链接数组或者以，分割的字符串                      | `string[] \| string` | --      |
| images   | 需要展示媒体图片链接数组或者以，分割的字符串                      | `string[] \| string` | --      |
| controls | 是否显示视频播放控件                                  | `boolean`            | `true`  |
| autoplay | 视频是否自动播放                                    | `boolean`            | `false` |

## 源代码

[gitee medaSwiper](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/medaSwiper)
