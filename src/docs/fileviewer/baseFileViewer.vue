<template>
  <h4>pdf预览</h4>
  <zh-fileviewer style="width: 100%; height: 600px;"
                 url="/demo.pdf"
                 fileType="pdf"
                 :initialPage="1"
                 :initialScale="1.5"
  />

  <el-divider/>

  <h4>ofd预览</h4>
  <zh-fileviewer style="width: 100%; height: 600px;"
                 url="/test.ofd"
                 fileType="ofd"
  />

  <el-divider/>

  <h4>word预览</h4>
  <zh-fileviewer style="width: 100%; height: 600px;"
                 url="/demo.docx"
                 fileType="word"
  />

  <el-divider/>

  <h4>excel预览</h4>
  <zh-fileviewer style="width: 100%; height: 600px;"
                 url="/demo.et"
                 fileType="excel"
  />
</template>

<script setup lang="ts">

</script>
