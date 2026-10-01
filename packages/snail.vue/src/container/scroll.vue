<!-- 滚动视图组件：
    1、通用逻辑封装到 ./utils/scroll-util.ts 中
-->
<template>
    <div :="$attrs" class="snail-scroll" ref="scroll-root">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { useScopes } from "snail.core";
import { ScrollDetail, useScroll } from "snail.view";
import { onMounted, useTemplateRef } from "vue";
import { ScrollEvents, ScrollHandle, ScrollOptions } from "./models/scroll-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
defineOptions({ name: "Scroll", inheritAttrs: false, });
const props = defineProps<ScrollOptions>();
const emits = defineEmits<ScrollEvents>();
const rootDom = useTemplateRef("scroll-root");
const scopes = useScopes();
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 相应滚动视图回调
 * - 进行滚动相关事件触发
 * @param detail 
 */
function onScrollDetail(detail: ScrollDetail) {
    const { now, pre } = detail;
    emits("change", now, pre);
    //  水平滚动条变化：初始状态若出现滚动条，也触发xbar事件
    {
        const barChange = (now == pre && now.xbar == true) || now.xbar != pre.xbar;
        barChange && emits("xbar", now.xbar);
        if (now.xbar == true) {
            now.left && now.left != pre.left && emits("left");
            now.right && now.right != pre.right && emits("right");
        }
    }
    //  垂直滚动条变化：初始状态若出现滚动条，也触发ybar事件
    {
        const barChange = (now == pre && now.ybar == true) || now.ybar != pre.ybar;
        barChange && emits("ybar", now.ybar)
        if (now.ybar == true) {
            now.top && now.top != pre.top && emits("top");
            now.bottom && now.bottom != pre.bottom && emits("bottom");
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    const manager = scopes.add(useScroll(
        rootDom.value,
        props,
        onScrollDetail)
    );
    const handle: ScrollHandle = {
        getStatus: manager.getStatus,
        scroll: manager.scroll,
        scrollTo: manager.scrollTo,
    };
    emits("ready", Object.freeze(handle));
});
</script>

<style lang="less">
.snail-scroll {
    overflow: auto;
}
</style>