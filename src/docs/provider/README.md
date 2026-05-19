<script setup>
import baseAuthProvider from './baseAuthProvider.vue';
import baseAuthControl from './baseAuthControl.vue';
</script>

# provider 高阶组件

> 这是高阶组件，接收 permissions 属性，并将合并后的权限通过 provide 向下传递。
> 应用场景：例如：权限控制一个表格多个角色使用时，按钮多少不定

## 基础用法

在根组件（App.vue）定义全局权限

<show-code showPath="provider/baseAuthProvider">
<baseAuthProvider></baseAuthProvider>
</show-code>

在页面中控制按钮显隐
<show-code showPath="provider/baseAuthControl">
<baseAuthControl></baseAuthControl>
</show-code>

> **Tip**<br>
> 在 ChildComponent 中，user:add 来自父级（若存在），user:delete 被覆盖为 true，admin:secret 变为可用。不合并父级可设置 :
> merge="false"。

## authProvider 属性

| 属性          | 说明                     | 类型                       | 可选值        | 默认值  |
|-------------|------------------------|--------------------------|------------|------|
| permissions | 当前层级的权限集（必须）           | Record\<string, boolean> | --         | --   |
| merge       | 是否与父级权限合并，子级权限可覆盖父级同名键 | boolean                  | true/false | true |

## authControl 属性

| 属性         | 说明                                               | 类型                  | 可选值                 | 默认值    |
|------------|--------------------------------------------------|---------------------|---------------------|--------|
| permission | 所需权限名称                                           | string              | --                  | --     |
| mode       | 无权限时的表现：hide 隐藏整个元素，disable 保留元素但通过插槽暴露 disabled | 'hide' \| 'disable' | 'hide' \| 'disable' | 'hide' |

## authControl 插槽

| 属性      | 作用域                                           | 说明                                                  | 
|---------|-----------------------------------------------|-----------------------------------------------------|
| default | { hasPermission: boolean, disabled: boolean } | 默认内容；disabled 在 mode='disable' 无权限时为 true，否则为 false |

## usePermission 返回值

| 名称            | 类型                                     | 说明         | 
|---------------|----------------------------------------|------------|
| permissions   | ComputedRef\<Record\<string, boolean>> | 当前合并后的权限对象 |
| hasPermission | (key: string) => boolean               | 判断是否拥有某个权限 | 

## 源代码

[gitee provider](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/provider)
