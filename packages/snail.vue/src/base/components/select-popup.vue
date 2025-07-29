<!-- 选项菜单 弹窗组件
    1、展示多个【选择项】，支持分组、多级别
    2、最多展示两级，若为分组节点，则展示 分组+子选项
    3、若为item节点，则展示item
    4、配合 ../select.vue 使用，无法独立使用
    5、搜索框需要搜索时，对外发送事件，由【../select.vue】完成搜索处理，并更新选项数据
-->
<template>
    <div v-if="isArrayNotEmpty(props.items) == false" :class="{ 'child-popup': props.level > 1 }"
        class="select-popup text-tips" @mouseleave.self="onMouseLeave" @mouseenter.self="mouseStatus = 'Enter'">
        暂无可选项
    </div>
    <div v-else class="select-popup" :class="{ 'has-group': hasGroupItem, 'child-popup': props.level > 1 }"
        @mouseleave.self="onMouseLeave" @mouseenter.self="mouseStatus = 'Enter'">
        <Search v-if="props.search" :placeholder="props.searchPlaceholder || '请输入'" :auto-complete="true"
            @search="onSearch" />
        <template v-if="noMatched == false" v-for="node in props.items" :key="newId()">
            <SelectNodeVue :="node" @mouseenter.self="onItemMouseEnter($event, node, undefined);"
                @click="onItemClick(node)" />
            <SelectNodeVue v-if="node.item.type == 'group' && isArrayNotEmpty(node.children) == true" class="child"
                v-for="child in node.children" :key="newId()" :="child"
                @mouseenter.self="onItemMouseEnter($event, child, node);" @click="onItemClick(child, node)" />
        </template>
        <Empty v-if="noMatched" :message="'无结果'" />
    </div>
</template>

<script setup lang="ts">
import { IAsyncScope, isArrayNotEmpty, newId, tidyString, useTimer } from "snail.core";
import { shallowRef, computed, } from "vue";
import { usePopup } from "../../popup/manager";
import { searchSelectNode } from "../utils/select-util";
//  依赖的其他vue组件
import Search from "../search.vue";
import Empty from "../../prompt/empty.vue";
import SelectNodeVue from "./select-node.vue";
//  使用到的数据类型
import { PopupStatus, } from "../../popup/models/popup-model";
import { FollowHandle } from "../../popup/models/follow-model";
import { SearchEvents } from "../models/search-model";
import { SelectBaseEvents, SelectItem, SelectNode, SelectOptions, SelectPopupOptions } from "../models/select-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SelectPopupOptions<any> & FollowHandle<SelectItem<any>[]> & { followStatus: PopupStatus }>();
const emits = defineEmits<SelectBaseEvents<any> & SearchEvents>();
const { follow } = usePopup();
const { onTimeout } = useTimer();
/** 是否有【分组选择项】 */
const hasGroupItem = computed(() => (props.items || []).find(node => node.item.type == "group") != undefined);
/** 无匹配项 */
const noMatched = shallowRef<boolean>(false);
/** 针对当前弹窗时的鼠标状态 */
var mouseStatus: "Enter" | "Leave" = "Leave";
/** 子作用域 */
var followScope: IAsyncScope<SelectItem<any>[]> = undefined;
/** 子跟随目标元素 */
var childFollowTargetDom: HTMLElement = undefined;

//  2、可选配置选项
defineOptions({ name: "SelectPopup", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 鼠标离开弹窗时
 */
function onMouseLeave() {
    mouseStatus = "Leave";
    //  非1级弹窗自动关闭；若没有打开子弹窗，则自动关闭
    props.level > 1
        && (followScope == undefined || followScope.destroyed)
        && props.closeFollow(undefined);
}
/**
 * 搜索事件
 * @param text 
 */
function onSearch(text: string) {
    text = tidyString(text) || "";
    noMatched.value = searchSelectNode(props.items, text.toLowerCase()) == false;
}
/**
 * 选项选择后
 * @param path 选项路径，从父->子
 */
function onSelected(...path: SelectItem<any>[]) {
    const values = path.filter(item => item != undefined);
    emits("change", values);
    props.multiple || props.closeFollow(values);
}

/**
 * 选项鼠标进入事件
 */
async function onItemMouseEnter(event: MouseEvent, node: SelectNode<any>, parent?: SelectNode<any>) {
    //  非【打开】状态，不响应：点击【选择项】关闭当前弹窗时，异步销毁过程中，鼠标移动到其他【选择项】了，此时不能再打开了
    if (props.followStatus.value != "open") {
        return;
    }
    //  以前的子若没有销毁，则根据情况判断销毁或者保留
    if (followScope && followScope.destroyed == false) {
        if (event.target == childFollowTargetDom) {
            return;
        }
        followScope.destroy();
        childFollowTargetDom = undefined;
    }
    //  二级分类选项，弹出子选项follow弹窗；此时强制无需search
    if (node.item.type == "group" && parent) {
        childFollowTargetDom = event.target as HTMLElement;
        const selectPopupOptions: SelectPopupOptions<any> = {
            /** 这里传入的时候，需要作用响应式，否则到里面后会丢失响应式，具体原因待查 */
            items: shallowRef(node.children) as any,
            search: false,
            level: props.level + 1,
            values: props.values,
        };

        followScope = follow(childFollowTargetDom, {
            name: "SelectPopup",
            followY: "center",
            spaceClient: 10,
            props: selectPopupOptions,
        });
        //  等待弹窗结束，如果有选中项，则对外分发
        const datas = await followScope;
        isArrayNotEmpty(datas) && onSelected(parent ? parent.item : undefined, node.item, ...datas);
        //  若销毁下级弹窗时，未进入当前弹窗，则触发当前弹窗的鼠标离开事件
        props.followStatus.value == "open" && onTimeout(() => mouseStatus != "Enter" && onMouseLeave(), 10);
    }
}
/**
 * 选项点击事件
 * @param item 
 * @param parent 
 */
function onItemClick(node: SelectNode<any>, parent?: SelectNode<any>) {
    //  选择项 可点击时，才有效；多选时，修改一下选中状态
    if (node.item.clickable == true) {
        props.multiple && (node.selected.value = true);
        onSelected(parent ? parent.item : undefined, node.item);
    }
}

// *****************************************   👉  组件渲染    *****************************************
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.select-popup {
    max-height: 90%;
    min-height: 32px;
    overflow: auto;
    background: #fff;
    box-shadow: 0px 1px 5px 1px #dddfed;
    border: 1px solid #dddfed;
    border-radius: 4px;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    >div.snail-search {
        margin: 12px;
    }

    >div.select-item {
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

}

// *****************************************   👉  特殊样式适配    *****************************************
//  无可用选项
.select-popup.text-tips {
    padding: 0 20px;
}

//  有分组时
.select-popup.has-group {}

//  子的选项弹窗
.select-popup.child-popup {
    min-width: 150px;
    max-width: 250px;
    padding-top: 6px;
    padding-bottom: 6px;
}
</style>