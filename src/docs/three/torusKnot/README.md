<script setup> 
import torusKnot from './torusKnot.vue';
</script>

# torusKnot 动画

## 基础用法

<show-code showPath="three/torusKnot/torusKnot">
<torusKnot></torusKnot>
</show-code>

#

## torusKnot 属性

| 属性                     | 说明                         | 类型                                           | 默认值         |
|------------------------|----------------------------|----------------------------------------------|-------------|
| modelOptions           | 模型配置列表，必填 id, name, apiUrl | ModelConfig[]                                | 内置5个示例      |
| defaultModel           | 默认选中的模型 ID                 | string                                       | 'gpt-4'     |
| userAvatar / botAvatar | 头像图片链接                     | string                                       | DiceBear 头像 |
| chatHandler            | 自定义请求函数，不传则使用模拟响应          | (req: ChatRequest) => Promise\<ChatResponse> | undefined   |
| dark                   | 是否启用深色主题（支持 .sync）         | boolean                                      | false       |

## 功能说明与使用方式：

| 功能    | 实现方式                                                            |
|-------|-----------------------------------------------------------------|
| 多模型支持 | 下拉切换 DeepSeek、GPT-4、Claude 3、文心一言、通义千问，回复风格自动适配                 |
| 对话核心  | 文本键入发送，模拟 AI 打字效果，支持 Markdown 加粗、代码等简易渲染                        |
| 文件上传  | 利用 Element Plus Upload 组件添加文件（PDF/DOCX/图片等），随消息一并发送，AI 回复会告知已处理 |
| 一键生成  | 四个快捷按钮分别对应「生成PPT」「生成图片/海报」「生成文档」，点击后自动填充提示词并触发生成                |
| 内容预览  | 生成结果以卡片形式展示在消息中，点击可弹窗预览（图片直接显示，PPT/文档提供下载链接）                    |
| 主题切换  | 浅色/深色模式一键切换，保护夜间视力                                              |
| 响应式交互 | 消息自动滚动、加载动画、圆角玻璃质感设计                                            |
| 交互细节  | 消息气泡靠左/右对齐、时间格式化、滚动到底部、历史消息加载提示等。                               |

## 源代码

[gitee three](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/three)
