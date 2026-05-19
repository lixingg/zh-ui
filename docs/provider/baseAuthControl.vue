<template>
  <div>
    <h3> 隐藏模式（默认）</h3>
    <zh-auth-control permission="user:add">
      <el-button type="primary">新增用户</el-button>
    </zh-auth-control>

    <zh-auth-control permission="user:delete">
      <el-button type="danger">删除用户</el-button>
    </zh-auth-control>

    <h3> 禁用但可见模式</h3>
    <zh-auth-control permission="user:edit" mode="disable" v-slot="{ disabled }">
      <el-button :disabled="disabled">编辑用户</el-button>
    </zh-auth-control>

    <h3> 控制整个模块显隐</h3>
    <zh-auth-control  permission="report:view">
      <div class="report-module">
        <!-- 报表模块内容 -->
      </div>
    </zh-auth-control >

    <h3> 嵌套权限（多层叠加）</h3>
    <p>你可以在任何子组件中再次使用 PermissionProvider 来扩展或覆盖权限，这在不同业务区域有独立权限时非常有用。</p>
    <div>
      <h2>父级区域</h2>
      <zh-auth-control permission="user:add">
        <button>父级按钮</button>
      </zh-auth-control>

      <!-- 嵌套提供者，合并父级权限并新增/覆盖 -->
      <zh-auth-control :permissions="{ 'user:delete': true, 'admin:secret': true }">
        <ChildComponent />
      </zh-auth-control>
    </div>
  </div>
</template>
<script setup lang="ts">
/**
 * 程序化判断（组合式函数）
 * 在 setup 或其它组合式函数中可以直接使用 usePermission 获取权限状态：
 * */

/*import { usePermission } from 'zhui-plus';

const { hasPermission } = usePermission();

function handleAction() {
  if (hasPermission('user:edit')) {
    // 执行编辑逻辑
  } else {
    ElMessage.warning('无编辑权限');
  }
}*/
</script>


