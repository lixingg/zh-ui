<script setup> 
import baseEditor from './baseEditor.vue';
import baseCEditor from './baseCEditor.vue';
</script>

# Editor 编辑器

## 基础用法

基于tinymce-vue开发的组件

<show-code showPath="editor/baseEditor">
<baseEditor></baseEditor>
</show-code>

基于原生tinymce开发的组件
<show-code showPath="editor/baseCEditor">
<baseCEditor></baseCEditor>
</show-code>

## Editor 属性

| 属性            | 说明                                      | 类型                                                               | 默认值       |
|---------------|-----------------------------------------|------------------------------------------------------------------|-----------|
| modelValue    | 编辑器的内容 (HTML)，支持 v-model                | `string`                                                         | ''        |
| height        | 编辑器高度，支持数字(px)或CSS单位字符串                 | `string` \| `number`                                             | '100%'    |
| width         | 编辑器宽度，支持数字(px)或CSS单位字符串                 | `string` \| `number`                                             | '100%'    |
| disabled      | 是否禁用编辑（只读模式）                            | `boolean`                                                        | `false`   |
| placeholder   | 占位文本                                    | `string`                                                         | ''        |
| plugins       | 启用的插件列表，传入字符串（空格分隔）或数组                  | `string` \| `string[]`                                           | 见下方默认插件列表 |
| toolbar       | 工具栏按钮，传入字符串（空格或\|分隔）或数组                 | `string` \| `string[]`                                           | 见下方默认工具栏  |
| apiKey        | TinyMCE 云服务 API Key，留空则使用自托管资源          | `string`                                                         | ''        |
| language      | 界面语言，默认中文                               | `string`                                                         | `zh_CN`   |
| onImageUpload | 图片上传回调，返回图片URL                          | (file: File, progress?: (p: number) => void) => Promise\<string> | `--`      |
| onFileUpload  | 文件（非图片附件）上传回调                           | `(file: File) => Promise<string>`                                | `--`      |
| onVideoUpload | 视频上传回调                                  | `(file: File) => Promise<string>`                                | `--`      |
| customInit    | 完全自定义的 TinyMCE 初始化配置，会与默认配置合并（自定义优先级最高） | `Record<string, any>`                                            | `{}`      |

## 默认 plugins：

'preview', 'importcss', 'searchreplace', 'autolink', 'autosave',
'save', 'directionality', 'code', 'visualblocks', 'visualchars',
'fullscreen', 'image', 'link', 'media', 'template', 'codesample',
'table', 'charmap', 'pagebreak', 'nonbreaking', 'anchor',
'insertdatetime', 'advlist', 'lists', 'wordcount', 'help',
'charmap', 'emoticons', 'quickbars'

## 默认 toolbar：

'undo redo | blocks fontsize | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter
alignright alignjustify | bullist numlist outdent indent | removeformat | link image media video | fullscreen preview |
code'

## 事件 (Events)：

| 事件名               | 说明                    | 回调参数                    |
|-------------------|-----------------------|-------------------------|
| update:modelValue | 内容变化时触发，用于 v-model 更新 | (value: string)         |
| init              | 编辑器初始化完成时触发，返回编辑器实例   | (editor: TinyMCEEditor) |

## 暴露方法 (Expose)

通过 ref 获取组件实例后，可调用以下方法：

| 方法名        | 说明               | 参数类型            | 返回值                   |
|------------|------------------|-----------------|-----------------------|
| getEditor  | 获取 TinyMCE 编辑器实例 | -               | TinyMCEEditor \| null |
| setContent | 设置编辑器内容          | content: string | —                     |
| getContent | 获取编辑器当前 HTML 内容  | —               | string                |

## 源代码

[gitee editor](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/editor)
