<!-- 头部 组件
    1、组件宽度100%；高度固定 47px
    2、支持外部传入 标题（无则不展示标题区域）、标题对其位置、关闭按钮是否需要
    3、支持外部传入 插槽
-->
<template>
    <div class="snail-header" :class="useTo" v-bind:class="{ 'start-divider': divider }">
        <!-- 标题区域 -->
        <div v-if="title != ''" v-text="title" class="header-title" :class="titleAlign" />
        <!-- 插槽区域，自定义内容 -->
        <slot class="header-slot" />
        <!-- 关闭按钮区域 -->
        <Icon v-if="closeDisable != true" class="close-icon" :="closeIconOptions" @click="emit('close')" />
    </div>
</template>

<script setup lang="ts">
import { HeaderOptions, HeaderEvents } from "./models/header-model";
import Icon from "./icon.vue";
import { IconOptions } from "./models/icon-model";
import { computed } from "vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data、event
const { useTo = 'page', divider, title = "", titleAlign = "center", closeDisable = false } = defineProps<HeaderOptions>();
const emit = defineEmits<HeaderEvents>();
/**     关闭按钮配置选项 */
const closeIconOptions = computed<IconOptions>(() => ({
    type: "close",
    color: useTo == "page" ? "#2e3033" : "#464953",
    size: useTo == "page" ? 24 : 20,
}));
//  2、可选配置选项
defineOptions({ name: "Header", inheritAttrs: true, });
</script>

<style lang="less">
.snail-header {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: white;

    >.header-title {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        color: #2e3033;
        line-height: 48px;
        padding-left: 24px;
        flex: 1;

        &.center {
            text-align: center;
        }

        &.right {
            text-align: right;
        }
    }

    >.header-slot {
        flex: 1;
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
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