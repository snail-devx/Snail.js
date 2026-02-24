<!-- 组件介绍写到这里 -->
<template>
    <slot />
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance, onUnmounted, onBeforeUnmount, nextTick, shallowRef } from "vue";
import { SortEvents, SortOptions, SortGroupOptions, SortEvent } from "./models/sort-model";
import { IScope, isFunction, isObject, isStringNotEmpty, newId, script, useTimer } from "snail.core";
import { useReactive } from "../base/reactive";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SortOptions<any>>();
const emits = defineEmits<SortEvents>();
const { watcher } = useReactive();
const { onTimeout } = useTimer();
/**     Sortable.js 模块 */
var MODULE_Sortable = undefined;
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
function buildSortable() {
    //  先销毁掉
    {
        sortInstance && sortInstance.destroy();
        sortInstance = undefined;
        sortPanel.classList.remove("sortable");
    }
    //  可用时，才构建
    if (props.disabled != true && MODULE_Sortable != undefined) {
        sortPanel.classList.add("sortable");
        //  构建分组配置选项
        const group: SortGroupOptions = { name: undefined, pull: true, put: true };
        isStringNotEmpty(props.group)
            ? (group.name = props.group as string)
            : isObject(props.group) && Object.assign(group, props.group);
        group.name || (group.name = newId());
        //  put和pull配置处理
        if (typeof group.pull == "function") {
            const orign = group.pull;
            group.pull = (to: any, from: any, item: HTMLElement) => orign(item, to.el, from.el);
        }
        if (typeof group.put == "function") {
            const orign = group.put;
            group.put = (to: any, from: any, item: HTMLElement) => orign(item, to.el, from.el);
        }
        //  构建排序对象
        sortInstance = new MODULE_Sortable(sortPanel, {
            group: group,
            sort: props.sortDisabled != true,
            draggable: props.draggable,
            dragClass: props.dragClass || "snail-sort-drag",
            ghostClass: props.ghostClass || "snail-sort-ghost",
            handle: props.handle || props.draggable,
            filter: props.filter,
            preventOnFilter: false,
            animation: props.animation > 0 ? props.animation : 150,
            //  默认配置，还没特别搞懂，先强制
            forceFallback: true,
            fallbackTolerance: 2,
            //  事件监听
            onStart: (evt: SortEvent) => emits("start", evt),
            onMove: (evt, originalEvent) => emits("move", evt, originalEvent),
            onAdd: (evt: SortEvent) => emits("add", evt),
            onRemove: (evt: SortEvent) => emits("remove", evt),
            onEnd: (evt: SortEvent) => emits("end", evt),
            onUpdate: (evt: SortEvent) => emits("update", evt.oldIndex, evt.newIndex),
        });
    }
}
// *****************************************   👉  组件渲染    *****************************************
onMounted(async () => {
    const instance = getCurrentInstance();
    sortPanel = instance.vnode.el.parentElement;
    MODULE_Sortable = await script.load<any>("sortablejs");
    var timerScope: IScope = undefined;
    //  构建排序；挂载完成后，先构建一次；避免外部一开始有数据，则不会触发changer监听、
    buildSortable();
    watcher(() => props.disabled, buildSortable);
    //      变化器监听：监听外部数据变化，重新构建排序，但做一下延迟，避免频繁触发
    watcher(() => props.changer, () => {
        timerScope && timerScope.destroy();
        timerScope = onTimeout(() => buildSortable(), 100);
    });
})
onBeforeUnmount(() => sortInstance && sortInstance.destroy());
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

//  拖动元素：随着鼠标移动，脱离文档流了
.snail-sort-drag {
    cursor: move;
    border-radius: 4px;
    border: solid 1px #4c9aff;
    background: white;
}

//  幽灵元素：推动元素 在排序面板中的占位元素
.snail-sort-ghost {
    border-radius: 4px;
    border: dashed 1px #4c9aff;
}
</style>