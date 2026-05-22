<script setup>
import hlsPlayer from './hlsPlayer.vue';
</script>

# hlsPlayer 播放器

## 基础用法

<show-code showPath="videoPlayer/hlsPlayer/hlsPlayer">
<hlsPlayer></hlsPlayer>
</show-code>


> **Tip**<br>
>- 直播流建议设置 live 为 true，以优化 Hls.js 的同步参数并隐藏无效进度条。
>- 自动播放策略限制：大多数浏览器要求 muted 为 true 时才能自动播放，请在 autoplay 时同步设置 muted。
>- 全屏功能使用 containerRef 触发，确保组件容器支持全屏 API。
>- 组件默认样式使用 scoped，外部可通过 CSS 变量覆盖关键颜色，或直接传入 class / style 修改容器。

## hlsPlayer 属性

| 属性               | 说明                                 | 类型                       | 默认值     |
|------------------|------------------------------------|--------------------------|---------|
| src              | m3u8 播放地址                          | string                   | --      | --   |
| live             | 是否为直播，直播时会隐藏进度条并显示 LIVE 标识         | boolean                  | false   |
| autoplay         | 是否自动播放（需配合 muted 使用）               | boolean                  | false   |
| muted            | 是否静音                               | boolean                  | false   |
| controls         | 是否显示默认控制栏（若使用自定义 controls 插槽则自动隐藏） | boolean                  | true    |
| poster           | 视频封面图                              | string                   | --      |
| width            | 播放器宽度                              | string \| number         | '100%'  |
| height           | 播放器高度                              | string \| number         | 'auto'  |
| hlsConfig        | Hls.js 初始化配置，会与组件内置配置合并            | Partial\<Hls\['config']> | {}      |
| errorDisplay     | 错误展示策略：'fatal' 仅致命错误，'all' 全部错误    | 'fatal' \| 'all'         | 'fatal' |
| default-controls | 是否使用默认控件                           | boolean                  | false   |

## hlsPlayer 事件

| 事件名                 | 说明                           | 回调参数                                                   |
|---------------------|------------------------------|--------------------------------------------------------|
| loadstart           | 开始加载数据                       | (event: Event)                                         | 
| canplay             | 可以开始播放                       | (event: Event)                                         |
| play                | 播放事件                         | (event: Event)                                         |
| pause               | 暂停事件                         | (event: Event)                                         |
| ended               | 播放结束（回放模式）                   | (event: Event)                                         |
| timeupdate          | 时间更新                         | (event: Event)                                         |
| volumechange        | 音量变化                         | (event: Event)                                         |
| error               | 播放器错误（包含 HLS 错误和原生 video 错误） | { type: string, message: string, originalEvent?: any } |
| hls-error           | HLS 原始错误事件                   | (data: Hls.ErrorData)                                  |
| hls-manifest-parsed | HLS 清单解析完成                   | (data: Hls.ManifestParsedData)                         |
| fullscreenchange    | 全屏状态变化                       | (isFullscreen: boolean)                                |

## hlsPlayer 插槽

| 属性       | 作用域                                                                                                                                            | 说明                    | 
|----------|------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| controls | { playing, currentTime, duration, volume, muted, isFullscreen, live, error, retry, togglePlay, toggleMute, seek, setVolume, toggleFullscreen } | 完全自定义控制栏，使用后默认控制栏不再渲染 |
| error    | { error: { message: string, fatal: boolean }, retry: () => void }                                                                              | 自定义错误展示               | 

## hlsPlayer Exposes

| 名称                     | 说明               | 
|------------------------|------------------|
| videoRef               | 原生 video 元素引用    |
| hlsInstance            | Hls 实例（可能为 null） | 
| play()                 | 播放               | 
| pause()                | 暂停               | 
| togglePlay()           | 切换播放/暂停          | 
| seek(time: number)     | 跳转到指定时间（秒）       | 
| setVolume(vol: number) | 设置音量 0~1         | 
| toggleMute()           | 切换静音             | 
| toggleFullscreen()     | 切换全屏             | 
| retry()                | 重试加载             | 

## 源代码

[gitee videoPlayer](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/videoPlayer)
