<!-- 图标组件：
    1、集成一些常用的图标，如关闭、警告、错误等， 通过type做区分 
    2、采用svg方式实现，不使用字体图片，按需引入
-->
<template>
    <svg class="snail-icon" :class="type" v-bind:class="{ button: button }"
        :viewBox="correctString(viewBox, '0 0 1024 1024', false)" :="sizeRef" :style="styleRef"
        @mouseenter="isMouseEnterRef = true" @mouseleave="isMouseEnterRef = false">
        <title v-text="title || ''" />
        <!-- 定义图标绘制时 -->
        <template v-if="custom == true">
            <slot />
        </template>
        <!-- 内置图标绘制 -->
        <path v-else v-for="d in getBuiltinIcon(type)" :d="d" />
    </svg>
</template>

<script setup lang="ts">
import { computed, ref, ShallowRef, shallowRef } from "vue";
import { IconOptions } from "./models/icon-model";
import { getBuiltinIcon } from "./utils/icon-util";
import { correctNumber, correctString, isObject } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<IconOptions>();
//  2、组件交互变量、常量
/**     是否是鼠标进入了 */
const isMouseEnterRef: ShallowRef<boolean> = shallowRef(false);
/**     图标尺寸，包含高度、宽度值 */
const sizeRef = computed(() => {
    if (isObject(props.size) == true) {
        return {
            width: correctNumber((props.size as any).width, 24),
            height: correctNumber((props.size as any).height, 24)
        }
    }
    else {
        const number = correctNumber(props.size, 24);
        return {
            width: number,
            height: number
        };
    }
});
/**     图标样式变量：旋转，鼠标移入颜色 */
const styleRef = computed(() => {
    const style = Object.create(null);
    //  fill样式
    let fill = isMouseEnterRef.value ? correctString(props.hoverColor, props.color, true) : undefined;
    fill == undefined && (fill = correctString(props.color, undefined, true));
    fill && (style.fill = fill);
    //  旋转样式
    const rotate = correctNumber(props.rotate, 0);
    rotate != 0 && (style.transform = `rotate(${rotate}deg)`);

    return style;
});

// *****************************************   👉  方法事件    *****************************************

</script>
<style lang="less">
.snail-icon {
    transition: all 0.2s linear;
    fill: #8a8099;
    opacity: 1;

    &.button {
        cursor: pointer;
    }
}
</style>