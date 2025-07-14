<!-- 按钮组件：做一些常见按钮样式的封装 -->
<template>
    <div class="snail-button" :class="[props.size, props.type]">
        <slot>按钮</slot>
    </div>
</template>

<script setup lang="ts">
import { ButtonOptions } from "./models/button-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ButtonOptions>();
//  2、可选配置选项
defineOptions({ name: "Button", inheritAttrs: true, });
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-button {
    cursor: pointer;
    border-radius: 2px;
    font-size: 14px;
    white-space: nowrap;
    user-select: none;
    // flex 布局：display: flex，align-items、justify-content 都为center
    .flex-center();
    display: inline-flex;
}

// *****************************************   👉  特殊样式适配    *****************************************
.snail-button.max {
    width: 120px;
    height: 40px;
}

.snail-button.middle {
    width: 90px;
    height: 32px;
}

.snail-button.normal {
    width: 54px;
    height: 28px;
}

.snail-button.small {
    width: 30px;
    height: 20px;
}

.snail-button.primary {
    background-color: #5ca3ff;
    color: white;
}

.snail-button.default {
    background-color: white;
    border: 1px solid #dddfed;
    color: #2e2f33;
}

.snail-button.link {
    color: #4c9aff;
}
</style>