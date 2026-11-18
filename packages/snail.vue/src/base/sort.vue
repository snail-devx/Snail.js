<!-- 组件介绍写到这里 -->
<template>
    <slot />
</template>

<script setup lang="ts">
import { IScope, isObject, isStringNotEmpty, newId, script, useTimer } from "snail.core";
import { getCurrentInstance, onBeforeUnmount, onMounted } from "vue";
import { useReactive } from "../base/reactive";
import { SortEvent, SortEvents, SortGroupOptions, SortOptions } from "./models/sort-model";

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
            onUpdate: onUpdate,
        });
    }
}
/**
 * 拖拽更新位置时触发
 * @param evt 
 */
function onUpdate(evt: SortEvent) {
    /**
     * 执行到这里时，这里还原真实dom到原始位置，保证vnode和真实dom一致
     *      1、若不还原，会导致一些奇怪现象：如三个元素 1、2、3，将2拖拽到3，然后再push元素4，此时4在1的后面
     *      2、出现此问题的原因：deepseek分析的解决方案，qwen没分析出来（它推荐重新渲染）
     *          1、SortableJS 直接操作了真实 DOM，Vue 的虚拟 DOM 不知道这次移动。
     *          2、拖拽后真实 DOM 顺序已经变成 1,3,2，Vue 内部旧 vnode 顺序/节点锚点仍可能按 1,2,3 
     *          3、在 diff；后续 push 新数据时，Vue 找插入锚点就会错，出现“新数据跑到第 1/2 个位置”的现象。
     * 处理要点：
     *      1、先只处理同容器下的移动，跨容器移动、新增、删除，不处理，交给外部自己处理，或者后期看情况再说
     * 注意事项：
     *      1、还有一种处理方式：每次重构排序时，为当前 Slot 插槽重置key值，但这样会导致每次都重新渲染，性能较低
     */
    const { from, to, item, oldIndex, newIndex } = evt;
    if (from && item && from === to && oldIndex !== newIndex) {
        //  oldIndex > newIndex 时，参照节点要往后取一个
        const refIndex = oldIndex + (oldIndex > newIndex ? 1 : 0);
        const reference = from.children[refIndex] || null;
        from.insertBefore(item, reference);
    }

    emits("update", evt.oldIndex, evt.newIndex)
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

//  幽灵元素：拖动元素 在排序面板中的占位元素
.snail-sort-ghost {
    border-radius: 4px;
    border: dashed 1px #4c9aff;
}
</style>