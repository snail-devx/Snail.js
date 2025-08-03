<!-- 选项菜单【选择项】节点组件
    1、若有子项，则展示箭头；不做任何事件控制 
    2、配合 ./select-popup.vue 使用，无法独立使用
 -->
<template>
    <div class="select-node" :class="classRef" :title="item.text" ref="select-node"
        @mouseenter="emits('enter', selectNodDom)" @mouseleave="() => emits('leave', selectNodDom)"
        @click="() => emits('click', selectNodDom)">
        <div class="item-text" v-text="item.text" />
        <Icon v-if="item.type == 'group'" :type="'arrow'" :color="'#8a9099'" />
    </div>
</template>

<script setup lang="ts">
import Icon from "../icon.vue";
import { computed, useTemplateRef } from "vue";
import { SelectNodeEvents, SelectNodeOptions } from "../models/select-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { item } = defineProps<SelectNodeOptions<any>>();
const emits = defineEmits<SelectNodeEvents>();
/** 【选择项】节点Dom元素 */
const selectNodDom = useTemplateRef("select-node");
/** 自定义的class样式：动态计算 */
const classRef = computed(() => ({
    clickable: item.clickable,
    group: item.type == 'group',
    item: item.type != 'group',
    // selected: selected.value
}));

//  2、可选配置选项
defineOptions({ name: "SelectNode", inheritAttrs: true, });

// *****************************************   👉  事件、方法    *****************************************
</script>

<style lang="less">
//  引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

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
        //  文本溢出时出省略号
        .text-ellipsis();
    }

    >svg.snail-icon {
        cursor: default;
        display: none;
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