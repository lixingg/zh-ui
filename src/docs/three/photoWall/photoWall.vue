<template>
  <div class="demo-container">
    <zh-photoWall
        ref="wall"
        v-model:selectedIndex="selectedIdx"
        :photos="photoList"
        :shapes="['wall', 'cube', 'sphere']"
        :autoSwitch="true"
        :switchInterval="10000"
        :transitionDuration="2500"
        :autoShow="true"
        :wallCols="15"
        :autoShowInterval="3500"
        :showDuration="3000"
        :spotlightScale="1.6"
        @select="onSelect"
        @deselect="onDeselect"
        @autoShow="onAutoShow"
        @autoHide="onAutoHide"
    >
      <template #default="{ photo, visible, close }">
        <Transition name="panel-fade">
          <div v-if="visible" class="info-card">
            <img :src="photo.url" class="avatar"/>
            <div class="text">
              <h3>{{ photo.name }}</h3>
              <p>性别：{{ photo.gender }}</p>
              <p>部门：{{ photo.dept }}</p>
            </div>
            <button class="close-btn" @click="close">✕</button>
          </div>
        </Transition>
      </template>
    </zh-photoWall>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'

interface Photo {
  id: number;
  url: string;
  name: string;
  gender: string;
  dept: string;
}

const selectedIdx = ref<number | null>(null)
const photoList = ref<Photo[]>([])

function onSelect(photo: any, index: number) {
  console.log('选中:', photo, index)
}

function onDeselect(photo: any, index: number) {
  console.log('取消选中:', photo, index)
}

function onAutoShow(p: Photo, i: number) {
  console.log('自动展示:', p.name)
}

function onAutoHide(p: Photo, i: number) {
  console.log('自动返回:', p.name)
}

function getPhotoList() {
  const list = []
  for (let i = 0; i < 100; i++) {
    list.push({
      id: i,
      url: `https://picsum.photos/80/60?random=${i + 100}`,
      name: `test${i}`,
      gender: `${i % 2 == 0 ? '男' : '女'}`,
      dept: '测试部'
    })
  }
  photoList.value = list
}

onMounted(() => {
  getPhotoList()
})

</script>

<style>
.demo-container {
  width: 100%;
  height: 60vh;
  overflow: hidden;
  background: #0a0a1f;
}

.info-card {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 50, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 10;
}

.thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
