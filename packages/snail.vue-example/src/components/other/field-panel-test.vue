<!-- 组件介绍写到这里 -->
<template>
    <FieldPanel :title="'反馈时间'" required :error="'ddd'" :description="'x'">
        <input type="text" />
    </FieldPanel>
    <FieldPanel :title="'完成情况'" required>
        <textarea />
    </FieldPanel>
    <FieldPanel :title="'默认'" required>
        <input type="text" />
    </FieldPanel>
    <FieldPanel :title="'附件'" required>
        <span>附件</span>
    </FieldPanel>
    <FieldPanel :title="'测试只读'" required>
        <div>测试只读</div>
    </FieldPanel>
    <FieldPanel :title="'测试只读'" required>
        <span>测试只读</span>
    </FieldPanel>
</template>

<script setup lang="ts">
import { components } from '../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { FieldPanel } = components;
//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>