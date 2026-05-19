<template>
  <div class="app-container">
    <zh-chat
        userId="user_self"
        contactId="contact_001"
        contactName="小明"
        myAvatar="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        contactAvatar="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        wsUrl="ws://localhost:8080"
        @video-call="handleVideoCall"
    />
  </div>
</template>

<script setup lang="ts">
const handleVideoCall = (data: { userId: string; contactId: string }) => {
  console.log('发起视频通话', data)
  // 这里可以触发 WebRTC 信令流程等
  alert(`正在向 ${data.contactId} 发起视频通话...`)
}
</script>

<style lang="scss" scoped>
.app-container {
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  //background: #e0e0e0;
}
</style>
