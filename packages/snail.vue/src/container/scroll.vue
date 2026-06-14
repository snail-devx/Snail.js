<!-- 滚动视图组件：
    1、通用逻辑封装到 ./utils/scroll-util.ts 中
-->
<template>
    <div :="$attrs" class="snail-scroll" :class="classStyleRef" ref="scroll-root">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, ShallowRef, useTemplateRef } from "vue";
import { ScrollOptions, ScrollEvents, ScrollExpose } from "./models/scroll-model"
import { IScrollManager, useScroll } from "snail.view";
import { monitScroll } from "./utils/scroll-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
defineOptions({ name: "Scroll", inheritAttrs: false, });
const props = defineProps<ScrollOptions>();
const emits = defineEmits<ScrollEvents>();
const rootDom = useTemplateRef("scroll-root");
const manager: IScrollManager = useScroll();
//  2、组件交互变量、常量
/** 自定义类样式 */
const classStyleRef: ShallowRef<string[]> = shallowRef<string[]>();
//  3、对外暴露接口
defineExpose<ScrollExpose>({
    getStatus() {
        return manager.getStatus(rootDom.value);
    },
    scroll(left?: number, top?: number) {
        left == undefined || (rootDom.value.scrollLeft += left);
        top == undefined || (rootDom.value.scrollTop += top);
    },
    scrollTo(left?: number, top?: number): void {
        left == undefined || (rootDom.value.scrollLeft = left);
        top == undefined || (rootDom.value.scrollTop = top);
    },
});

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => monitScroll(manager, rootDom.value, props, emits, classStyleRef));
</script>

<style lang="less">
.snail-scroll {
    overflow: auto;
}
</style>