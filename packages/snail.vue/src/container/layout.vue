<!-- 布局组件：
    1、支持横向布局（左中右）、垂直布局（上中下）
    2、通过插槽插入内容，默认插槽为中间区域，start、end为左右、上下区域
    3、中间区域自动伸缩，支持滚动
-->
<template>
    <div class="snail-layout" :class="mode">
        <div class="layout-start" v-if="$slots.start">
            <slot name="start" />
        </div>
        <Scroll class="layout-body" :="scroll">
            <slot />
        </Scroll>
        <div class="layout-end" v-if="$slots.end">
            <slot name="end" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { LayoutOptions } from "./models/layout-model";
import Scroll from "./scroll.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<LayoutOptions>();

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-layout {
    display: flex;
    //  width:100%；height:100%；overflow: hidden
    .wh-fill-hidden();

    >.layout-start,
    >.layout-end {
        flex-shrink: 0;
    }

    //  内容区域，自动缩放
    >.layout-body {
        flex: 1;
    }
}

// *****************************************   👉  特殊样式适配    *****************************************

//  水平布局
.snail-layout.horizontal {
    flex-direction: row;

    >div {
        height: 100%;
    }

    >.layout-start,
    >.layout-end {
        width: fit-content;
    }
}

//  垂直布局
.snail-layout.vertical {
    flex-direction: column;

    >div {
        width: 100%;
    }

    >.layout-start,
    >.layout-end {
        height: fit-content;
    }
}
</style>