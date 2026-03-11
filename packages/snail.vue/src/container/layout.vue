<!-- 布局组件：
    1、支持横向布局（左中右）、垂直布局（上中下）
    2、通过插槽插入内容，默认插槽为中间区域
    3、若对应区域未启用滚动配置，则是不使用Scroll组件，通过template做一下v-if；
-->
<template>
    <div class="snail-layout" :class="mode">
        <template v-for="item in ['top', 'left', 'default', 'right', 'bottom']" :key="item">
            <template v-if="areaMap[item] && $slots[item]">
                <Scroll v-if="areaMap[item].scrollable" :class="areaMap[item].class" :style="areaMap[item].style"
                    :="props[item].scroll">
                    <slot :name="item" />
                </Scroll>
                <div v-else :class="areaMap[item].class" :style="areaMap[item].style">
                    <slot :name="item" />
                </div>
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, useSlots, } from "vue";
import { LayoutAreaItem, LayoutOptions } from "./models/layout-model";
import Scroll from "./scroll.vue";
import { css, HeightStyle, WidthStyle, } from "snail.view";
import { SlotsType } from "./models/component-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<LayoutOptions>();
defineSlots<SlotsType<Pick<LayoutOptions, "default" | "top" | "bottom" | "left" | "right">>>();
//  2、组件交互变量、常量
/** 布局区域映射，key为插槽名称，value为对应的布局配置项相关信息 */
const areaMap = computed(() => {
    const map: Record<"default" | "top" | "bottom" | "left" | "right", LayoutAreaItem> = Object.create(null);
    map.default = {
        scrollable: props.default && props.default.scroll != undefined,
        class: "main-area",
        style: undefined,
    };
    //  垂直布局时，顶部、底部区域
    if (props.mode == "vertical") {
        map.top = {
            scrollable: props.top && props.top.scroll != undefined,
            class: "top-area",
            style: buildHeightStyle(props.top),
        };
        map.bottom = {
            scrollable: props.bottom && props.bottom.scroll != undefined,
            class: "bottom-area",
            style: buildHeightStyle(props.bottom),
        }
    }
    //  水平布局时，左侧、右侧区域
    else {
        map.left = {
            scrollable: props.left && props.left.scroll != undefined,
            class: "left-area",
            style: buildWidthStyle(props.left),
        };
        map.right = {
            scrollable: props.right && props.right.scroll != undefined,
            class: "right-area",
            style: buildWidthStyle(props.right),
        }
    }
    return map;
});

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建宽度样式
 * @param style 
 */
function buildWidthStyle(style: WidthStyle) {
    return style
        ? css.buildStyle({ minWidth: style.minWidth, width: style.width, maxWidth: style.maxWidth })
        : undefined;
}
/**
 * 构建高度样式
 * @param style 
 */
function buildHeightStyle(style: HeightStyle) {
    return style
        ? css.buildStyle({ minHeight: style.minHeight, height: style.height, maxHeight: style.maxHeight })
        : undefined;
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-layout {
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;

    //  非滚动视图区域，强制溢出隐藏
    >div:not(.snail-scroll) {
        overflow: hidden;
    }

    //  主内容区域弹性
    >div.main-area {
        flex: 1;
    }

    //  水平布局：左中右
    &.horizontal {

        >div.left-area,
        >div.right-area {
            flex-shrink: 0;
            width: fit-content;
        }
    }

    //  垂直布局：上中下
    &.vertical {
        flex-direction: column;

        >div.top-area,
        >div.bottom-area {
            flex-shrink: 0;
            height: fit-content;
        }
    }
}
</style>