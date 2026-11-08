<!-- 图标组件：
    1、集成一些常用的图标，如关闭、警告、错误等， 通过type做区分 
    2、采用svg方式实现，不使用字体图片，按需引入
-->
<template>
    <svg class="snail-icon" :class="[type, namespace]" v-bind:class="{ button, custom, }"
        :viewBox="correctString(viewBox, '0 0 1024 1024', false)" :="sizeRef" @click="evt => emits('click', evt)">
        <title v-text="title || ''" />
        <!-- 自定义图标绘制 -->
        <template v-if="custom == true">
            <slot />
        </template>
        <!-- 内置图标绘制 -->
        <path v-else v-for="d in baseRef.path" :d="d" />
    </svg>
</template>

<script setup lang="ts">
import { correctNumber, correctString, isObject } from "snail.core";
import { useStyle } from "snail.view";
import { computed, onMounted } from "vue";
import { ClickEvents } from "./models/base-event";
import { IconOptions } from "./models/icon-model";
import { useReactive } from "./reactive";
import { getBuiltinIconOptions } from "./utils/icon-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<IconOptions>();
const emits = defineEmits<ClickEvents>();
const { namespace, build } = useStyle();
const { watcher } = useReactive();
//  2、组件交互变量、常量
/**     图标基础配置 */
const baseRef = computed<ReturnType<typeof getBuiltinIconOptions>>(() => props.custom
    ? Object.create(null)
    : getBuiltinIconOptions(props.type)
);
/**     图标尺寸，包含高度、宽度值 */
const sizeRef = computed(() => {
    const size = props.size || baseRef.value.size;
    const { width, height } = isObject(size) ? size as any : { width: size, height: size };
    return {
        width: correctNumber(width, 14),
        height: correctNumber(height, 14)
    };
});

// *****************************************   👉  方法事件    *****************************************
/**
 * 构建用户自定义样式
 */
function buildUserStyle() {
    const style = Object.create(null);
    //  图标颜色
    let color = correctString(props.color || baseRef.value.color, undefined, true);
    color && (style["--color"] = color);
    color = correctString(props.hoverColor || baseRef.value.hoverColor, color, true);
    color && (style["--hover-color"] = color);
    //  旋转样式
    const rotate = correctNumber(props.rotate == undefined ? baseRef.value.rotate : props.rotate, 0);
    rotate != 0 && (style.transform = `rotate(${rotate}deg)`);
    //  透明度
    const opacity = correctNumber(props.opacity, undefined);
    opacity >= 0 && (style.opacity = opacity);
    //  边框、背景色
    style.border = correctString(props.border, undefined, true);
    style.padding = correctString(props.padding, undefined, true);
    style.borderRadius = correctString(props.radius, undefined, true);
    style.background = correctString(props.background, undefined, true);

    build([{
        rule: "svg",
        mode: "nesting",
        style: style,
    }]);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
watcher(() => ({ ...props }), buildUserStyle);
//  2、生命周期响应
onMounted(buildUserStyle)

</script>
<style lang="less">
.snail-icon {
    transition: all 0.2s linear;
    opacity: 1;
    flex-shrink: 0;

    --color: #8a9099;
    --hover-color: #8a9099;
    fill: var(--color);

    &.button {
        cursor: pointer;
    }
}

//  仅在拥有精确指针设备（如鼠标）时应用 hover 效果；避免 移动端 点击后，也会保留 :hover 效果
@media (hover: hover) and (pointer: fine) {
    .snail-icon:hover {
        fill: var(--hover-color);
    }
}
</style>