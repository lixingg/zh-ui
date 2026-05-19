<template>
  <div class="demo">
    <h4>签名组件示例 (支持 v-model 双向绑定)</h4>
    <zh-signature
        v-model="signatureData"
        :width="700"
        :height="300"
        pen-color="#3366cc"
        :pen-width="3"
        bg-color="#fef9e6"
        :show-controls="true"
        :disabled="false"
    />
    <div class="info">
      <p><strong>当前签名 (Base64 长度):</strong> {{ signatureData ? `${signatureData.length} 字符` : '无数据' }}</p>
      <button @click="clearExternal">外部清空</button>
      <button @click="loadDemoSignature">加载示例签名</button>
    </div>
    <el-divider />
    <h4>不显示操作按钮</h4>
    <zh-signature
        v-model="signatureData1"
        ref="signatureRef"
        :width="700"
        :height="300"
        pen-color="#3366cc"
        :pen-width="3"
        bg-color="#fef9e6"
        :show-controls="false"
        :disabled="false"
    />
    <div class="info">
      <p><strong>当前签名 (Base64 长度):</strong> {{ signatureData ? `${signatureData.length} 字符` : '无数据' }}</p>
      <button @click="clearExternal">外部清空</button>
      <button @click="loadDemoSignature">加载示例签名</button>
      <button @click="saveImage">保存图片</button>
      <button @click="undo">撤销</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const signatureData = ref<string | any>(null)
const signatureData1 = ref<string | any>(null)
const signatureRef = ref<any>(null)

// 使用双向绑定值重置实现清空操作
function clearExternal() {
  signatureData.value = null
  signatureData1.value = null
}
// 外部调用保存图片事件
function saveImage(){
  signatureRef.value.saveAsImage()
}

// 外部调用撤销事件
function undo(){
  signatureRef.value.undo()
}

function loadDemoSignature() {
  // 模拟一个预设签名图片 (一个简单的红色叉叉示意，仅用于演示)
  const canvas = document.createElement('canvas')
  canvas.width = 700
  canvas.height = 300
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#fef9e6'
    ctx.fillRect(0, 0, 700, 300)
    ctx.strokeStyle = '#3366cc'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(100, 100)
    ctx.lineTo(600, 200)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(600, 100)
    ctx.lineTo(100, 200)
    ctx.stroke()
    signatureData.value = canvas.toDataURL()
    signatureData1.value = canvas.toDataURL()
  }
}
</script>

<style>
.demo {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.info {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  align-items: center;
}
button {
  padding: 6px 14px;
  cursor: pointer;
}
</style>
