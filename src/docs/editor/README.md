<script setup> 
import baseEditor from './baseEditor.vue';
</script>

# Editor 编辑器


## 基础用法

<show-code showPath="editor/baseEditor">
<baseEditor></baseEditor>
</show-code>


## Chat 属性
| 属性                       | 说明 | 类型 | 默认值      |
|--------------------------| - | - |----------|
| userId / contactId       | 双方标识 | `string` | `number` | '' |
| contactName              | 对方名称| string    | --       |
| myAvatar / contactAvatar | 自定义头像URL（可选） | `string` | --       |
| wsUrl                 | WebSocket 服务地址 | `string` | `--`     |


## 功能说明与使用方式：
| 功能 | 实现方式 |
| - | - |
| 文字/表情 | 输入框支持文字，Enter 发送；表情通过弹出面板选择，单独表情会以大图显示。 |
| 图片 | 点击📷图标选择本地图片，模拟上传后返回URL并发送。 |
| 语音 | 点击🎤开始录音，再次点击停止发送，使用 MediaRecorder API。 |
| 视频 | 选择视频文件发送，显示带播放按钮的预览图，点击可弹出播放。 |
| 文件 |选择任意文件发送，显示文件名与大小，支持下载。 |
| 头像 | 通过 myAvatar 和 contactAvatar props 传入自定义头像；加载失败显示默认图。 |
| 长连接 | 内置 WebSocket 连接管理，自动重连；消息发送与接收均通过 WS 进行。 |
|交互细节 | 消息气泡靠左/右对齐、时间格式化、滚动到底部、历史消息加载提示等。 |

## 源代码
[gitee editor](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/editor)
