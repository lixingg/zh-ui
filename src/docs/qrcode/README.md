<script setup>
import baseQrcode from './baseQrcode.vue';
</script>

# qrcode 二维码生成器

>功能：生成带Logo的二维码，支持微信、QQ、支付宝等主流应用扫码识别
特性：
- 可配置二维码内容URL
- 可配置中心Logo图片
- 高容错级别（H级，30%纠错能力），确保带Logo仍可扫描
- Logo自动添加白色背景层，提升扫码成功率
- 响应式尺寸、颜色配置

## 基础用法
使用默认图标文字和样式
<show-code showPath="qrcode/baseQrcode">
<baseQrcode></baseQrcode>
</show-code>

## qrcode 属性
| 属性        | 说明                     | 类型                         | 可选值 | 默认值        |
|-----------|------------------------|----------------------------|-----|------------|
| value       | 二维码内容（URL或任意文本）                  | string                     | --  | 必填         |
| logo  | Logo图片地址（支持网络URL、Base64、本地静态资源）                | string                     | --  | --         |
| size      | 二维码尺寸（像素）               | number                     | --  | 200        |
| logoSizeRatio      | Logo占二维码尺寸的比例（0-0.3，推荐0.2-0.25）                | number                     | --  | 0.2        |
| logoBackgroundColor     | Logo背景颜色           | string                     | --  | '#ffffff'  |
| logoBackgroundRadius      | Logo背景圆角半径（像素） | number                     | --  | 8          |
| logoPadding  | Logo背景内边距（像素）   | number                     | --  | 4          |
| colorDark | 二维码深色块颜色   | string                     | --  | '#000000'	 |
| colorLight | 二维码浅色块颜色（背景）   | string                     | --  | '#ffffff'	 |
| errorCorrectionLevel | 纠错级别（H级30%纠错能力最适合带Logo）   | 'L'   \| 'M' \| 'Q' \| 'H' | --  | 'H'	       |
| margin | 二维码边距（模块数）   | number                     | --  | 2	         |


## 源代码
[gitee qrcode](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/qrcode)
