<!-- 图标组件：
    1、集成一些常用的图标，如关闭、警告、错误等， 通过type做区分 
    2、采用svg方式实现，不使用字体图片，按需引入
-->
<template>
    <svg class="snail-icon" :class="type" v-bind:class="{ button: button }"
        :viewBox="correctString(viewBox, '0 0 1024 1024', false)" :="sizeRef" :style="styleRef"
        @click="evt => emits('click', evt)">
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
import { ClickEvents } from "./models/base-event";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<IconOptions>();
const emits = defineEmits<ClickEvents>();
//  2、组件交互变量、常量
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
    let fill = correctString(props.color, undefined, true);
    fill && (style["--fill"] = fill);
    fill = correctString(props.hoverColor, fill, true);
    fill && (style["--hover"] = fill);
    // let fill = isMouseEnterRef.value ? correctString(props.hoverColor, props.color, true) : undefined;
    // fill == undefined && (fill = correctString(props.color, undefined, true));
    // fill && (style.fill = fill);
    //  旋转样式
    const rotate = correctNumber(props.rotate, 0);
    rotate != 0 && (style.transform = `rotate(${rotate}deg)`);
    //  透明度
    const opacity = correctNumber(props.opacity, undefined);
    opacity >= 0 && (style.opacity = opacity);
    //  边框、背景色
    style.border = correctString(props.border, undefined, true);
    style.borderRadius = correctString(props.radius, undefined, true);
    style.background = correctString(props.background, undefined, true);

    return style;
});

// *****************************************   👉  方法事件    *****************************************

</script>
<style lang="less">
.snail-icon {
    --fill: #8a8099;
    --hover: #8a8099;
    transition: all 0.2s linear;
    opacity: 1;
    fill: var(--fill);

    &.button {
        cursor: pointer;
    }



    //  鼠标移入颜色
    // &:hover {
    //     fill: var(--hover);
    // }
}

//  仅在拥有精确指针设备（如鼠标）时应用 hover 效果；避免 移动端 点击后，也会保留 :hover 效果
@media (hover: hover) and (pointer: fine) {
    .snail-icon:hover {
        fill: var(--hover);
    }
}
</style>