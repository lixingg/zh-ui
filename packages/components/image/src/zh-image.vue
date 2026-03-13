<template>
  <div class="image-box" v-for="(item,index) in fileList" :key="index">
    <el-icon v-if="remove" :size="16" color="#ccc" class="removeBtn" @click="removeItem(index)">
      <CircleCloseFilled />
    </el-icon>
    <el-image v-if="isPicture(item)"
              @click.stop.prevent="clickImage"
              :src="item"
              ref="imageRef"
              class="item"
              :preview-src-list="[item]"
              :style="$attrs.style"
              fit="contain" />
    <template v-else>
      <el-image v-if="getFileMs(item)"
                :src="getFileMs(item)?.icon"
                :style="$attrs.style"
                @click="downFile(item)"
                class="item"
                fit="contain" />
      <span v-else>-</span>
    </template>
    <div class="name"
         v-if="showName">{{ getFileMs(item).name }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps, defineEmits, ref, nextTick, h, render, defineExpose } from "vue";
import { Download } from '@element-plus/icons-vue'
import pdfIcon from '@/assets/images/pdf.png'
import wordIcon from '@/assets/images/word.png'
import excelIcon from '@/assets/images/excel.png'
import rarIcon from '@/assets/images/rar.png'
import picIcon from '@/assets/images/pic.png'
import unKnownIcon from '@/assets/images/unknown.png'

const props = defineProps<any>(['url', 'src', 'modelValue', 'showName', 'remove']);
const emits = defineEmits(['update:modelValue']);
const type = ref<string>('');
const imageRef = ref(null);
  interface item {
    url?: string;
    name?: string;
    icon?: string; // 可选属性用问号标记
  }
  const fileList = computed({
  getter:()=> {
  if (Array.isArray(props.url || props.src)) {
    type.value = 'array';
    return props.url || props.src || props.modelValue;
  }
  if (typeof props.url === "string") {
    type.value = "string";
    return props.url.split(",");
  }
  if (typeof props.src === "string") {
    type.value = "string";
    return props.src.split(",");
  }
  if (typeof props.modelValue === "string") {
    type.value = "string";
    return props.modelValue.split(",");
  }
},
  setter:(newVal:any):any => {
    const data = type.value == "string" ? newVal.join(",") : newVal;
    emits("update:modelValue", data);
  }
  });
const removeItem = (index) => {
  fileList.value.splice(index, 1);
  const data = type.value == "string" ? fileList.value.join(",") : fileList.value;
  emits("update:modelValue", data);
};
const downFile = (url) => {
  if (!url) return;
  window.open(url);
};
const isPicture = (url) => {
  if (!url || url == null) return false;
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(url);
};
const getFileMs = (url:string | null):(item | boolean) => {
  if (!url || url == null) return false;
  if (/\.(jpg|jpeg|png|gif|bmp|webp)$/.test(url)) {
    return {
      name: url.substring(url.lastIndexOf('/') + 1),
      url: url
    };
  }
  if (/\.(pdf)$/.test(url)) {
    return {
      name: url.substring(url.lastIndexOf('/') + 1),
      url: url,
      icon: pdfIcon
    };
  }
  if (/\.(doc|docx|wps)$/.test(url)) {
    return {
      name: url.substring(url.lastIndexOf('/') + 1),
      url: url,
      icon: wordIcon
    };
  }
  if (/\.(xlsx|xls|et)$/.test(url)) {
    return {
      name: url.substring(url.lastIndexOf('/') + 1),
      url: url,
      icon: excelIcon
    };
  }
  if (/\.(rar|zip)$/.test(url)) {
    return {
      name: url.substring(url.lastIndexOf('/') + 1),
      url: url,
      icon: rarIcon
    };
  }
  return {
    name: url.substring(url.lastIndexOf('/') + 1),
    url: url,
    icon: unKnownIcon
  };
};

/**
 * @description: 预览的图片添加下载按钮
 */
function clickImage() {
  nextTick(() => {
    setTimeout(() => {
      let wrapper = document.getElementsByClassName("el-image-viewer__actions__inner");
      let downImg = document.createElement("i");
      downImg.setAttribute("class", "el-icon");
      render(h(Download, { onClick: cusClickHandler }), downImg);
      wrapper[0].appendChild(downImg);
    });
  });
}

/**
 * @description: 预览的图片给下载按钮添加事件
 */
function cusClickHandler() {
  const imgUrl = (document.getElementsByClassName("el-image-viewer__img")[0] as HTMLImageElement).src
  let image = new Image();
  // 解决跨域 Canvas 污染问题
  image.setAttribute("crossOrigin", "anonymous");
  image.onload = function() {
    let canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    let context = (canvas.getContext("2d") as any);
    context.drawImage(image, 0, 0, image.width, image.height);
    let url = canvas.toDataURL("image/png"); //得到图片的base64编码数据
    let a = document.createElement("a"); // 生成一个a元素
    let event = new MouseEvent("click"); // 创建一个单击事件
    a.download = imgUrl.substring(imgUrl.lastIndexOf("/") + 1) || "photo"; // 设置图片名称
    a.href = url; // 将生成的URL设置为a.href属性
    a.dispatchEvent(event); // 触发a的单击事件
  };
  image.src = imgUrl;
}

defineExpose({ clickImage, imageRef });
</script>


<style scoped lang="scss">
.image-box {
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  //width: 100%;
  height: 100%;
  padding: 5px;
  flex-shrink: 0;

  .item {
    cursor: pointer;
  }
}

.name {
  font-size: 12px;
  color: #909399;
}

.removeBtn {
  position: absolute;
  top: 0;
  right: 10px;
  z-index: 999;
  cursor: pointer;
}
</style>
