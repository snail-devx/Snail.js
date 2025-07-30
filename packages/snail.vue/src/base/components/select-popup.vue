<!-- 选项菜单 弹窗组件
    1、展示多个【选择项】，支持分组、多级别
    2、最多展示两级，若为分组节点，则展示 分组+子选项
    3、若为item节点，则展示item
    4、配合 ../select.vue 使用，无法独立使用
    5、搜索框需要搜索时，对外发送事件，由【../select.vue】完成搜索处理，并更新选项数据
-->
<template>
    <div v-if="classRef['text-tips']" :class="classRef" @mouseleave="onLeavePopup"
        @mouseenter.self="mouseStatus = 'Enter'">
        暂无可选项
    </div>
    <div v-else :class="classRef" @mouseleave="onLeavePopup" @mouseenter.self="mouseStatus = 'Enter'">
        <Search v-if="props.search" :placeholder="props.searchPlaceholder || '请输入'" :auto-complete="true"
            @search="onSearch" />
        <template v-if="noMatched == false" v-for="node in props.items" :key="node.id">
            <SelectNodeVue :="node" :id="node.id" @enter="el => onEnterSelectNode(el, node, undefined)"
                @click="onClickSelectNode(node, undefined)" />
            <template v-if="node.item.type == 'group' && isArrayNotEmpty(node.children) == true">
                <SelectNodeVue class="child" v-for="child in node.children" :key="child.id" :="child" :id="child.id"
                    @enter="el => onEnterSelectNode(el, child, node)" @click="onClickSelectNode(child, node);" />
            </template>
        </template>
        <Empty v-if="noMatched" :message="'无结果'" />
    </div>
</template>

<script setup lang="ts">
import { IAsyncScope, isArrayNotEmpty, IScope, newId, tidyString, useTimer } from "snail.core";
import { shallowRef, computed, onUpdated, ShallowRef, } from "vue";
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
import { SelectBaseEvents, SelectItem, SelectNode, SelectPopupOptions, SelectPopupOptionsExtend } from "../models/select-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SelectPopupOptions<any> & SelectPopupOptionsExtend & FollowHandle<SelectItem<any>[]> & { followStatus: PopupStatus }>();
const emits = defineEmits<SelectBaseEvents<any> & SearchEvents>();
const { follow } = usePopup();
const { onTimeout } = useTimer();
/** 弹窗所需的类样式信息 */
const classRef = computed(() => ({
    "select-popup": true,
    /** 子【选择项】弹窗 */
    'child-popup': props.level > 1,
    /** 无【选择项】的文本提示区域 */
    'text-tips': isArrayNotEmpty(props.items) == false,
    /** 【选择项】中是否存在分组 */
    "has-group": (props.items || []).find(node => node.item.type == "group") != undefined,
}));
/** 搜索时，未匹配到任何【选择项】；仅在第一级弹窗有效 */
const noMatched = shallowRef<boolean>(false);
/** 子弹窗销毁的定时器；鼠标离开弹窗时，做延迟销毁；避免回到 此弹窗 的父【选择项】时，又重新打开此弹窗*/
const childDestroyTimer: ShallowRef<IScope> = shallowRef(undefined);
//  2、临时变量
/** 针对当前弹窗时的鼠标状态 */
var mouseStatus: "Enter" | "Leave" = "Leave";
/** 子【选择项】follow弹窗跟随的目标元素 */
var childFollowTargetDom: HTMLElement = undefined;
/** 子【选择项】follow弹窗作用域 */
var childFollowTScope: IAsyncScope<SelectItem<any>[]> = undefined;
//  3、可选配置选项
defineOptions({ name: "SelectPopup", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 鼠标离开弹窗时
 */
function onLeavePopup() {
    mouseStatus = "Leave";
    //  非1级弹窗自动关闭；若没有打开子弹窗，则自动关闭：做个延迟，避免回到 此弹窗 的父【选择项】时，又重新打开此弹窗
    if (props.level > 1 && (childFollowTScope == undefined || childFollowTScope.destroyed)) {
        props.childDestroyTimer.value = onTimeout(props.closeFollow, 200, undefined);
    }
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
 * 鼠标进入【选择项】
 */
async function onEnterSelectNode(target: HTMLDivElement, node: SelectNode<any>, parent?: SelectNode<any>) {
    //  非【打开】状态，不响应：点击【选择项】关闭当前弹窗时，异步销毁过程中，鼠标移动到其他【选择项】了，此时不能再打开了
    if (props.followStatus.value != "open") {
        return;
    }
    //  由子弹窗进入的父级弹窗，取消子弹窗的销毁逻辑
    {
        childFollowTScope && childFollowTScope.destroyed == false && childDestroyTimer.value && childDestroyTimer.value.destroy();
        childDestroyTimer.value = undefined;
    }
    //  以前的子若没有销毁，则根据情况判断销毁或者保留
    if (childFollowTScope && childFollowTScope.destroyed == false) {
        if (target == childFollowTargetDom) {
            return;
        }
        childFollowTScope.destroy();
        childFollowTargetDom = undefined;
    }
    //  二级分类选项，弹出子选项follow弹窗；此时强制无需search
    if (node.item.type == "group" && parent) {
        childFollowTargetDom = target;
        const selectPopupOptions: SelectPopupOptions<any> & SelectPopupOptionsExtend = {
            items: node.children,
            search: false,
            level: props.level + 1,
            values: props.values,
            childDestroyTimer: childDestroyTimer,
        };

        childFollowTScope = follow(childFollowTargetDom, {
            name: "SelectPopup",
            followY: "center",
            spaceClient: 10,
            props: selectPopupOptions,
        });
        //  等待弹窗结束，如果有选中项，则对外分发
        const datas = await childFollowTScope;
        isArrayNotEmpty(datas) && onSelected(parent ? parent.item : undefined, node.item, ...datas);
        //  若销毁下级弹窗时，未进入当前弹窗，则触发当前弹窗的鼠标离开事件
        props.followStatus.value == "open" && onTimeout(() => mouseStatus != "Enter" && onLeavePopup(), 10);
    }
}
/**
 * 点击【选择项】
 * @param item 
 * @param parent 
 */
function onClickSelectNode(node: SelectNode<any>, parent?: SelectNode<any>) {
    //  选择项 可点击时，才有效；多选时，修改一下选中状态
    if (node.item.clickable == true) {
        props.multiple && (node.selected.value = true);
        onSelected(parent ? parent.item : undefined, node.item);
    }
}

// *****************************************   👉  组件渲染    *****************************************
// onUpdated(() => console.log("-0-000000000000000000000000000000", props.level));
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
    padding-bottom: 6px;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    >div.snail-search {
        margin: 12px;
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  子的选项弹窗
.select-popup.child-popup {
    min-width: 150px;
    max-width: 250px;
    padding-top: 6px;
}

//  无可用选项
.select-popup.text-tips {
    padding: 0 12px;
    width: 100px !important;
    justify-content: center;
}

//  有分组时
.select-popup.has-group {}
</style>