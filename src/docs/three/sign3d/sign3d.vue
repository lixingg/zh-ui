<!-- App.vue -->
<template>
  <div style="height: 100vh; display: flex; flex-direction: column;">
    <zh-sign3d
        ref="signRef"
        :users="userList"
        :config="componentConfig"
        @countdown-end="onCountdownEnd"
    />
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

const userList = ref([
  { avatar: 'https://randomuser.me/api/portraits/men/1.jpg', name: '张伟', phone: '138xxxx0001', company: '某科技公司' },
  { avatar: 'https://randomuser.me/api/portraits/women/2.jpg', name: '李娜', extra: '签到成功' },
  // 更多用户...
])

const componentConfig = ref({
  shapes: ['sphere', 'cube', 'cylinder', 'wall'],
  autoChangeShape: true,
  shapeChangeInterval: 5000,
  rotateSpeed: 0.4,
  showCountdown: true,
  countdownFrom: 5,
  autoShowUsers: false,
  autoShowInterval: 4000,
})

const onCountdownEnd = () => {
  console.log('倒计时结束')
}

function getPhotoList(){
  const list =[]
  for(let i=0;i<100;i++){
    list.push({
      id:i,
      avatar:`https://picsum.photos/80/60?random=${i}`,
      name:`test${i}`,
      gender:`${i%2==0?'男':'女'}`,
      dept:'测试部'
    })
  }
  userList.value=list
}
let timer =null
onMounted(()=>{
  getPhotoList()
  let i = 101
  timer =setInterval(() => {
    if(i==200){
      getPhotoList()
      i=101
    }
    userList.value.push({
      avatar: `https://picsum.photos/80/60?random=${i}`,
      name: `test${i}`,
      gender: `${i % 2 == 0 ? '男' : '女'}`,

    })
    i++;
  }, 3000)
})
onBeforeUnmount(()=>{
  clearInterval(timer)
})
</script>

<style>
body { margin: 0; }
</style>
