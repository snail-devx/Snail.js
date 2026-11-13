<!-- 尾部组件：
    1、作为辅助组件存在，不对外暴露
    2、尾部放置按钮，作为Page、PopupShell.vue等组件使用
-->
<template>
    <div class="snail-footer" :class="{ 'start-divider': divider }" v-bind:class="align || 'end'">
        <template v-for="button in buttons" :key="button.id">
            <Button v-if="button.disabled != true" :size="button.size || 'max'" :type="button.type" :title="button.name"
                v-text="button.name" @click="evt => onButtonClick(button, evt)" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { isFunction } from 'snail.core';
import Button from '../button.vue';
import { FooterButton, FooterEvents, FooterOptions } from '../models/header-footer-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<FooterOptions>();
const emits = defineEmits<FooterEvents>();
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 按钮点击事件
 * @param button 
 * @param evt 
 */
function onButtonClick(button: FooterButton, evt: MouseEvent | TouchEvent | PointerEvent) {
    emits("click", button.id, evt);
    isFunction(button.click) && button.click();
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
.snail-footer {
    width: 100%;
    flex: none;
    overflow: hidden;
    background-color: white;
    height: 72px;
    padding: 0 40px;

    display: flex;
    align-items: center;
    gap: 20px;
}

//  1、启用分隔符
.snail-footer.start-divider {
    border-top: 1px solid #dddfed;
}

//  2、左对齐时，按钮给左边距
.snail-footer {
    &.start {
        justify-content: flex-start;
    }

    &.center {
        justify-content: center;
    }

    &.end {
        justify-content: flex-end;
    }
}
</style>