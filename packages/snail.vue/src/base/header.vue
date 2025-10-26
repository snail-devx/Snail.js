<!-- 头部 组件
    1、组件宽度100%；高度固定 47px
    2、支持外部传入 标题（无则不展示标题区域）、标题对其位置、关闭按钮是否需要
    3、支持外部传入 插槽
-->
<template>
    <header class="snail-header" :class="useTo" v-bind:class="{ 'start-divider': divider }">
        <!-- 标题区域 -->
        <div v-if="title != ''" v-text="title" class="header-title" :class="titleAlign" />
        <!-- 插槽区域，自定义内容 -->
        <slot />
        <!-- 关闭按钮区域 -->
        <Icon :type="'close'" :size="22" :color="useTo == 'page' ? '#2e3033' : '#464953'" class="close-icon"
            v-if="closeDisabled != true" @click="emits('close')" />
    </header>
</template>

<script setup lang="ts">
import { HeaderOptions, HeaderEvents } from "./models/header-model";
import Icon from "./icon.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data、event
const { useTo = 'page', divider, title = "", titleAlign = "center", closeDisabled = false } = defineProps<HeaderOptions>();
const emits = defineEmits<HeaderEvents>();
//  2、可选配置选项
defineOptions({ name: "Header", inheritAttrs: true, });
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-header {
    flex-shrink: 0;
    width: 100%;
    background-color: white;
    position: relative;
    // flex 布局：display: flex，align-items 为center
    .flex-cross-center();

    >.header-title {
        color: #2e3033;
        line-height: 48px;
        flex: 1;
        padding: 0 30px;
        //  文本溢出时出省略号
        .ellipsis();
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  标题文本对齐方式
.snail-header>.header-title {
    &.left {
        text-align: left;
    }

    &.center {
        text-align: center;
    }

    &.right {
        text-align: right;
    }
}

//  启用分隔符
.snail-header.start-divider {
    border-bottom: 1px solid #dddfed;
}

//  Page模式时：高度、字体差异；关闭按钮右边距
.snail-header.page {
    height: 48px;

    >.header-title {
        font-size: 16px;
        font-weight: bold;
    }

    >.close-icon {
        margin-right: 18px;
    }
}

//  Dialog模式时：高度差异、字体；关闭按钮做绝对定位
.snail-header.dialog {
    height: 64px;
    padding-top: 16px;

    >.header-title {
        font-size: 20px;
    }

    >.close-icon {
        position: absolute;
        top: 8px;
        right: 8px;
    }
}
</style>