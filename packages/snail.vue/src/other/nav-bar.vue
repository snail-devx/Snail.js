<!-- 导航条：移动端专属
    1、左侧：返回、关闭；支持自定义插槽，插槽名： left
    2、中间标题区域，支持自定义插槽，插槽名： center
    3、右侧暂无，支持自定义插槽，插槽名： right
  -->
<template>
    <div class="snail-nav-bar" v-cloak>
        <!-- 左侧区域：图标使用全新的，不用icon中的 arrow 和 plus ；效果上有点差异，后期看看 -->
        <div class="left-area">
            <slot name="left">
                <svg viewBox="0 0 24 24" width="34" height="34" stroke="currentColor" stroke-width="2" fill="none"
                    stroke-linecap="round" stroke-linejoin="round" @click="emits('back')">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none"
                    stroke-linecap="round" stroke-linejoin="round" @click="emits('close')">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </slot>
        </div>
        <!-- 标题区域 -->
        <div class="main-area ellipsis">
            <slot name="center">
                {{ title }}
            </slot>
        </div>
        <!-- 右侧区域 -->
        <div class="right-area">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NavBarEvents, NavBarOptions } from './models/nav-bar-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<NavBarOptions>();
const emits = defineEmits<NavBarEvents>();

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
.snail-nav-bar {
    user-select: none;
    position: relative;
    flex: none;
    width: 100%;
    height: fit-content;
    color: #000000;
    background-color: white;
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    //  全屏浏览器下的兼容适配，留出状态栏的空间出来
    padding-top: calc(env(safe-area-inset-top, 0));

    // 左右两边，强制固定100px；剩余的给中间区域
    .left-area,
    .right-area {
        flex: none;
        height: 44px;
        width: 100px;
        overflow: hidden;
        padding: 0 6px;
        display: flex;
        align-items: center;

        gap: 10px;

        >svg {
            cursor: pointer;
        }
    }

    // 主内容区域：显示标题，文本居中加粗
    .main-area {
        flex: 1;
        height: 44px;
        line-height: 44px;
        text-align: center;
        font-size: 18px;
        font-weight: 500;
    }
}
</style>