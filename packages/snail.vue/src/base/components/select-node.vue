<!-- 选项菜单【选择项】节点组件
    1、展示自身和直属子节点；鼠标以上子节点时，触发事件，通知 select-popup.vue
        1、自身若有子项，则展示箭头；不做任何事件控制 
    2、配合 ./select-popup.vue 使用，无法独立使用
        1、命名为 Select-Node ，避免和SelectItem数据结构重复，且此处展示 自身 + 子 ，不是单纯的 Item 自身数据，Node 更合适
 -->
<template>
    <div class="select-node" :class="classRef" v-if="showRef" :title="item.text" ref="select-node"
        @mouseenter="emits('enter', rootDom, item)" @click="() => emits('click', item)">
        <div class="item-text ellipsis" v-text="item.text" />
        <Icon v-if="item.type == 'group'" type="arrow" />
        <div class="select-status" v-else-if="multiple == true">
            <Icon type="success" button :size="12" :color="'white'" />
        </div>
    </div>
    <SelectNode v-if="showRef" v-for="child in showChildrenRef" :key="context.getKey(child)" :multiple="multiple"
        :item="child" :context="context" :show-children="false" @enter="el => emits('enter', el, child, item)"
        @click="emits('click', child, item)" />
</template>

<script setup lang="ts">
import Icon from "../icon.vue";
import { computed, useTemplateRef } from "vue";
import { SelectItem, SelectNodeEvents, SelectNodeOptions } from "../models/select-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { multiple, item, showChildren, context } = defineProps<SelectNodeOptions<any>>();
const emits = defineEmits<SelectNodeEvents<any>>();
/** 【选择项】根节点Dom元素 */
const rootDom = useTemplateRef("select-node");
/** 当前节点是否选中了 */
const selectedRef = computed(() => context.selected(multiple, item));
/** 节点是否显示：需要【补丁】节点 */
const showRef = computed(() => context.isShow(item, true));
/** 子节点是否显示：需要【补丁】节点；只有【分组选择项】才可显示子*/
const showChildrenRef = showChildren == true && item.type == "group"
    ? computed(() => (item.children || []).filter(item => context.isShow(item, true)))
    : [] as SelectItem<any>[];
/** 自定义的class样式：动态计算 */
const classRef = computed(() => ({
    child: showChildren != true,
    clickable: item.clickable,
    group: item.type == 'group',
    item: item.type != 'group',
    selected: selectedRef.value,
}));
//  2、可选配置选项
defineOptions({ name: "SelectNode", inheritAttrs: true, });
// *****************************************   👉  事件、方法    *****************************************

</script>

<style lang="less">
//  引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

//  【选择项】节点类样式，强制约束在【.snail-select】使用
.snail-select-popup>div.select-node {
    height: 32px;
    flex-shrink: 0;
    padding-left: 12px;
    //  flex 布局：display: flex，align-items 为center
    .flex-cross-center();
    flex-wrap: nowrap;

    &:hover {
        background: #f8f9fa;
    }


    &.clickable {
        cursor: pointer;
    }

    &.group {
        color: #8a9099;
    }

    &.item {
        color: #2e3033;
        padding-right: 10px;
    }

    //  选中状态
    &.selected {
        color: #4c9aff !important;
    }

    >div.item-text {
        flex: 1;
    }

    >svg.snail-icon {
        display: none;
    }

    //  选中状态：仅在多选模式下才显示出来
    >div.select-status {
        flex-shrink: 0;
        margin-left: 4px;
        height: 14px;
        width: 14px;
        border: 1px solid #8a9099;
        background: white;

        >svg {
            display: none;
        }
    }

    //  选中状态下的选择状态按钮
    &.selected>div.select-status {
        border: 1px solid #5ca3ff;
        background-color: #5ca3ff;

        >svg {
            display: block;
        }
    }

    //  子选项下的 图标才显示出来
    &.child {
        padding-left: 24px;
        color: #2e3033;

        >svg.snail-icon {
            display: initial;
        }
    }
}
</style>