<!--
  二维码生成器组件 - QrCodeWithLogo.vue
  功能：生成带Logo的二维码，支持微信、QQ、支付宝等主流应用扫码识别
  特性：
  - 可配置二维码内容URL
  - 可配置中心Logo图片
  - 高容错级别（H级，30%纠错能力），确保带Logo仍可扫描
  - Logo自动添加白色背景层，提升扫码成功率
  - 响应式尺寸、颜色配置
  - TypeScript类型安全
-->

<template>
  <div class="qr-code-container" :style="{ width: `${size}px`, height: `${size}px` }">
    <canvas ref="canvasRef" :width="size" :height="size" style="display: block"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, type PropType } from 'vue';
import QRCode from 'qrcode';

// 定义组件属性
const props = defineProps({
  // 必填：二维码内容（URL或任意文本）
  value: {
    type: String,
    required: true,
  },
  // 可选：Logo图片地址（支持网络URL、Base64、本地路径）
  logo: {
    type: String,
    default: '',
  },
  // 二维码尺寸（像素）
  size: {
    type: Number,
    default: 200,
  },
  // Logo占二维码尺寸的比例（0-0.3，推荐0.2-0.25，过大可能影响扫码）
  logoSizeRatio: {
    type: Number,
    default: 0.2,
    validator: (val: number) => val >= 0 && val <= 0.3,
  },
  // Logo背景颜色
  logoBackgroundColor: {
    type: String,
    default: '#ffffff',
  },
  // Logo背景圆角（像素）
  logoBackgroundRadius: {
    type: Number,
    default: 8,
  },
  // Logo背景内边距（像素）
  logoPadding: {
    type: Number,
    default: 4,
  },
  // 二维码深色块颜色
  colorDark: {
    type: String,
    default: '#000000',
  },
  // 二维码浅色块颜色（背景）
  colorLight: {
    type: String,
    default: '#ffffff',
  },
  // 纠错级别：L(7%) M(15%) Q(25%) H(30%)，带Logo必须使用H
  errorCorrectionLevel: {
    type: String as PropType<'L' | 'M' | 'Q' | 'H'>,
    default: 'H',
    validator: (val: string) => ['L', 'M', 'Q', 'H'].includes(val),
  },
  // 二维码边距（模块数）
  margin: {
    type: Number,
    default: 2,
  },
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
// 用于防止异步绘制过程中的竞态条件
let generationId = 0;

/**
 * 绘制Logo到二维码上
 * @param canvas Canvas元素
 * @param logoUrl Logo图片地址
 * @param logoSize  Logo实际绘制尺寸（像素）
 * @param backgroundColor 背景颜色
 * @param borderRadius 背景圆角
 * @param padding 背景内边距
 * @param currentGenId 当前生成ID，用于校验是否是最新调用
 */
const drawLogo = (
    canvas: HTMLCanvasElement,
    logoUrl: string,
    logoSize: number,
    backgroundColor: string,
    borderRadius: number,
    padding: number,
    currentGenId: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 如果当前生成ID与全局ID不符，放弃绘制
    if (currentGenId !== generationId) {
      reject(new Error('Generation outdated'));
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();
    // 设置跨域属性（如果图片支持CORS，可防止canvas被污染；即使不支持，扫码仍正常）
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // 再次检查是否过期
      if (currentGenId !== generationId) {
        reject(new Error('Generation outdated'));
        return;
      }

      // 计算Logo绘制区域（中心点）
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const logoWidth = logoSize;
      const logoHeight = logoSize;

      // 背景区域尺寸（加上内边距）
      const bgWidth = logoWidth + padding * 2;
      const bgHeight = logoHeight + padding * 2;
      const bgX = centerX - bgWidth / 2;
      const bgY = centerY - bgHeight / 2;

      // 绘制圆角背景矩形
      ctx.save();
      ctx.shadowBlur = 0; // 避免阴影干扰扫码
      ctx.beginPath();
      ctx.moveTo(bgX + borderRadius, bgY);
      ctx.lineTo(bgX + bgWidth - borderRadius, bgY);
      ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + borderRadius);
      ctx.lineTo(bgX + bgWidth, bgY + bgHeight - borderRadius);
      ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - borderRadius, bgY + bgHeight);
      ctx.lineTo(bgX + borderRadius, bgY + bgHeight);
      ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - borderRadius);
      ctx.lineTo(bgX, bgY + borderRadius);
      ctx.quadraticCurveTo(bgX, bgY, bgX + borderRadius, bgY);
      ctx.closePath();
      ctx.fillStyle = backgroundColor;
      ctx.fill();

      // 绘制Logo图片（保持宽高比，居中显示）
      const imgWidth = logoWidth;
      const imgHeight = logoHeight;
      const imgX = centerX - imgWidth / 2;
      const imgY = centerY - imgHeight / 2;
      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
      ctx.restore();
      resolve();
    };
    img.onerror = () => {
      console.error('QR Code Logo failed to load:', logoUrl);
      reject(new Error('Logo image load failed'));
    };
    img.src = logoUrl;
  });
};

/**
 * 生成二维码（包括基础二维码和Logo绘制）
 */
const generateQRCode = async () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const currentGenId = ++generationId;

  try {
    // 1. 生成基础二维码（高纠错级别）
    await QRCode.toCanvas(canvas, props.value, {
      width: props.size,
      margin: props.margin,
      errorCorrectionLevel: props.errorCorrectionLevel,
      color: {
        dark: props.colorDark,
        light: props.colorLight,
      },
    });

    // 再次检查是否仍然是最新调用（避免在生成二维码过程中props改变）
    if (currentGenId !== generationId) return;

    // 2. 如果有Logo，绘制Logo
    if (props.logo && props.logo.trim() !== '') {
      // 计算Logo实际尺寸（像素）
      const logoSizePx = props.size * props.logoSizeRatio;
      // 最小Logo尺寸限制（避免过小）
      const finalLogoSize = Math.max(16, Math.min(logoSizePx, props.size * 0.3));

      await drawLogo(
          canvas,
          props.logo,
          finalLogoSize,
          props.logoBackgroundColor,
          props.logoBackgroundRadius,
          props.logoPadding,
          currentGenId
      );
    }
  } catch (error) {
    console.error('QR Code generation failed:', error);
    // 降级：如果生成失败，在canvas上显示错误提示（可选）
    if (currentGenId === generationId && canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, props.size, props.size);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, props.size, props.size);
        ctx.fillStyle = '#ff0000';
        ctx.font = '12px Arial';
        ctx.fillText('二维码生成失败', 10, 20);
      }
    }
  }
};

// 监听属性变化，重新生成二维码
watch(
    () => [
      props.value,
      props.logo,
      props.size,
      props.logoSizeRatio,
      props.logoBackgroundColor,
      props.logoBackgroundRadius,
      props.logoPadding,
      props.colorDark,
      props.colorLight,
      props.errorCorrectionLevel,
      props.margin,
    ],
    () => {
      generateQRCode();
    },
    { deep: false, immediate: false }
);

// 组件挂载时生成
onMounted(() => {
  generateQRCode();
});

// 组件卸载前清理（没有额外需要清理的定时器，但可重置generationId避免后续回调）
onUnmounted(() => {
  generationId++; // 使任何待处理的异步绘制任务失效
});
</script>

<style scoped>
.qr-code-container {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
</style>
