<script setup>
import Focus from './focus.vue';
import IdCard from './idCard.vue';
import Phone from './phone.vue';
import Number from './number.vue';
</script>

# Directive 指令

> 全局注册 直接使用
> 应用场景：例如：对一些输入值或者权限做校验

## v-focus 指令
用来获取输入框焦点
<show-code showPath="directives/focus">
<Focus></Focus>
</show-code>

## v-idCard 指令
用来输入身份证号校验
<show-code showPath="directives/idCard">
<IdCard></IdCard>
</show-code>

## v-phone 指令
用来输入手机号校验
<show-code showPath="directives/phone">
<Phone></Phone>
</show-code>

## v-number 指令
用来输入数字校验
<show-code showPath="directives/number">
<Number></Number>
</show-code>



## 源代码
[gitee upload](https://gitee.com/lixindekongjian/zh-ui/tree/master/packages/components/directive)
