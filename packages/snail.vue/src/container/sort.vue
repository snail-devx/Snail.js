<!-- 组件介绍写到这里 -->
<template>
    <slot />
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance, onUnmounted } from "vue";
import { SortEvents, SortOptions } from "./models/sort-model";
import { newId, script } from "snail.core";
import { useReactive } from "../base/reactive";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SortOptions<any>>();
const emit = defineEmits<SortEvents>();
const { watcher } = useReactive();
/**     观察者，执行响应式 */
watcher(() => props.disabled, buildSortable);
watcher(() => props.changer, buildSortable);
/**      排序面板：组件父级元素*/
var sortPanel: HTMLElement = undefined;
/**     Sortable对象实例 */
var sortInstance = undefined;
//  2、可选配置选项
defineOptions({ name: "Sort", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建【可拖拽排序】对象
 */
async function buildSortable() {
    sortInstance && sortInstance.destroy();
    sortInstance = undefined;
    if (props.disabled != true) {
        console.log("sort.vue: buildSortable...");
        const Sortable = await script.load<any>("sortablejs");
        sortInstance = new Sortable(sortPanel, {
            group: props.group || newId(),
            draggable: props.draggable,
            handle: props.handle || props.draggable,
            dragClass: props.dragClass || "snail-sort-drag",
            ghostClass: props.ghostClass || "snail-sort-ghost",
            animation: props.animation > 0 ? props.animation : 150,
            //  默认配置，还没特别搞懂，先强制
            forceFallback: true,
            preventOnFilter: false,
            fallbackTolerance: 2,
            //  事件监听
            //      顺序发生变化时，通知外面
            onUpdate(evt) {
                emit("update", evt.oldIndex, evt.newIndex);
            }
        });
    }
}

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    const instance = getCurrentInstance();
    sortPanel = instance.vnode.el.parentElement;
})
onUnmounted(() => sortInstance && sortInstance.destroy());
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

//  拖动元素：随着鼠标移动，脱离文档流了
.snail-sort-drag {
    cursor: move;
    border-radius: 4px;
    border: solid 1px #4c9aff;
}

//  幽灵元素：推动元素 在排序面板中的占位元素
.snail-sort-ghost {
    border-radius: 4px;
    border: dashed 1px #4c9aff;
}
</style>