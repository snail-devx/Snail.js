<!-- 选项菜单 弹窗组件
    1、展示多个【选择项】，支持分组、多级别
    2、最多展示两级，若为分组节点，则展示 分组+子选项
    3、若为item节点，则展示item
    4、配合 ../select.vue 使用，无法独立使用
    5、搜索框需要搜索时，对外发送事件，由【../select.vue】完成搜索处理，并更新选项数据
-->
<template>
    <div v-if="classRef['text-tips']" :class="classRef" @mouseenter="onEnterPopup" @mouseleave="onLeavePopup">
        暂无可选项
    </div>
    <div v-else :class="classRef" :style="props.popupStyle" @mouseenter="onEnterPopup" @mouseleave="onLeavePopup">
        <Search v-if="props.search" :="props.search" @search="context.doSearch" />
        <template v-if="noMatched == false" v-for="node in props.items" :key="node.id">
            <SelectNode :item="node" :context="context" @enter="el => onEnterSelectNode(el, node, undefined)"
                @click="onClickSelectNode(node, undefined)" />
            <template v-if="node.type == 'group' && isArrayNotEmpty(node.children) == true">
                <SelectNode class="child" v-for="child in node.children" :key="child.id" :item="child"
                    :context="context" @enter="el => onEnterSelectNode(el, child, node)"
                    @click="onClickSelectNode(child, node);" />
            </template>
        </template>
        <Empty v-if="noMatched" :message="'无结果'" />
    </div>
</template>

<script setup lang="ts">
import { IAsyncScope, isArrayNotEmpty, IScope, tidyString, useTimer } from "snail.core";
import { shallowRef, computed, ShallowRef, } from "vue";
import { usePopup } from "../../popup/manager";
import { useReactive } from "../reactive";
//  依赖的其他vue组件
import Search from "../search.vue";
import Empty from "../../prompt/empty.vue";
import SelectNode from "./select-node.vue";
//  使用到的数据类型
import { FollowExtend, FollowHandle } from "../../popup/models/follow-model";
import { SearchEvents } from "../models/search-model";
import { SelectBaseEvents, SelectItem, SelectPopupExtend, SelectPopupOptions } from "../models/select-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SelectPopupOptions<any> & SelectPopupExtend & FollowHandle<SelectItem<any>[]> & FollowExtend>();
const { context } = props;
const emits = defineEmits<SelectBaseEvents<any> & SearchEvents>();
const { follow } = usePopup();
const { onTimeout } = useTimer();
const { watcher } = useReactive();
//  解构一些响应式变量，方便访问
const { popupStatus, pinned, parentPinned } = props;
/** 弹窗所需的类样式信息 */
const classRef = computed(() => ({
    "snail-select-popup": true,
    /** 子【选择项】弹窗 */
    'child-popup': props.level > 1,
    /** 无【选择项】的文本提示区域 */
    'text-tips': isArrayNotEmpty(props.items) == false,
    /** 【选择项】中是否存在分组 */
    "has-group": (props.items || []).find(node => node.type == "group") != undefined,
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
var childFollowScope: IAsyncScope<SelectItem<any>[]> = undefined;
//  3、可选配置选项
defineOptions({ name: "Select2Popup", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 鼠标进入弹窗时
 * - 【钉住】父级弹窗
 */
function onEnterPopup() {
    mouseStatus = "Enter";
    parentPinned && (parentPinned.value = true);
}
/**
 * 鼠标离开弹窗时
 * - 取消【钉住】父级弹窗
 */
function onLeavePopup() {
    mouseStatus = "Leave";
    parentPinned && (parentPinned.value = false);
    //  非1级弹窗自动关闭；若没有打开子弹窗，则自动关闭：做个延迟，避免回到 此弹窗 的父【选择项】时，又重新打开此弹窗
    if (props.level > 1 && (childFollowScope == undefined || childFollowScope.destroyed)) {
        props.childDestroyTimer.value = onTimeout(props.closePopup, 200, undefined);
    }
}
/**
 * 选项选择后
 * @param path 选项路径，从父->子
 */
function onSelected(...path: SelectItem<any>[]) {
    if (popupStatus.value != "closed") {
        const values = path.filter(item => item != undefined);
        emits("change", values);
        props.multiple || props.closePopup(values);
    }
}

/**
 * 鼠标进入【选择项】
 */
async function onEnterSelectNode(target: HTMLDivElement, node: SelectItem<any>, parent?: SelectItem<any>) {
    //  非【打开】状态，不响应：点击【选择项】关闭当前弹窗时，异步销毁过程中，鼠标移动到其他【选择项】了，此时不能再打开了
    if (popupStatus.value == "closed") {
        return;
    }
    //  目前还有子弹窗存在时，做一些特例逻辑
    if (childFollowScope && childFollowScope.destroyed == false) {
        //  取消子弹窗的销毁逻辑
        childDestroyTimer.value && childDestroyTimer.value.destroy();
        childDestroyTimer.value = undefined;
        //  target和之前的子弹窗选项 target 一致时，不用重复弹窗；否则销毁之前弹窗，再弹出新的
        if (target == childFollowTargetDom) {
            return;
        }
        childFollowScope.destroy();
        childFollowScope = undefined;
        childFollowTargetDom = undefined;
    }
    //  二级分类选项，弹出子选项follow弹窗；此时强制无需search
    if (node.type == "group" && parent) {
        childFollowTargetDom = target;
        childFollowScope = follow(childFollowTargetDom, {
            name: "SelectPopup",
            spaceClient: 10,
            followY: "ratio",
            //  x轴方向上的跟随策略：根据当前弹窗的x轴跟随策略，自动做优化，尽量避免3+级弹窗会覆盖主以前的弹窗
            followX: props.followX.value == "before"
                ? ["before", "after", "ratio"]
                : ["after", "before", "ratio"],
            //  子级【选择项】弹窗配置数据
            props: Object.freeze<SelectPopupOptions<any> & SelectPopupExtend>({
                items: node.children,
                context: context,
                search: undefined,
                level: props.level + 1,
                values: props.values,
                popupStyle: props.popupStyle,

                childDestroyTimer: childDestroyTimer,
                parentPinned: pinned,
            }),
        });
        //  等待弹窗结束，如果有选中项，则对外分发
        const datas = await childFollowScope;
        isArrayNotEmpty(datas) && onSelected(parent ? parent : undefined, node, ...datas);
        //  若销毁下级弹窗时，未进入当前弹窗，则触发当前弹窗的鼠标离开事件
        popupStatus.value == "open" && onTimeout(() => mouseStatus != "Enter" && onLeavePopup(), 10);
    }
}
/**
 * 点击【选择项】
 * @param item 
 * @param parent 
 */
function onClickSelectNode(node: SelectItem<any>, parent?: SelectItem<any>) {
    //  选择项 可点击时，才有效；多选时，修改一下选中状态
    if (node.clickable == true) {
        // props.multiple && (node = true);
        onSelected(parent ? parent : undefined, node);
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  监听【pinned】变化，当前弹窗【钉住】了，则父级弹窗同步【钉住】
watcher(pinned, newValue => newValue == true && parentPinned && (parentPinned.value = true));
//  监听【popupStatus】变化，同步销毁子级弹窗：usePopup会自定管理子弹窗销毁，但为异步有延迟，这里更为即时
watcher(popupStatus, newValue => newValue == "closed" && childFollowScope && childFollowScope.destroy());
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-select-popup {
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
.snail-select-popup.child-popup {
    min-width: 200px;
    max-width: 250px;
    padding-top: 6px;
}

//  无可用选项
.snail-select-popup.text-tips {
    padding: 0 12px;
    width: 100px !important;
    justify-content: center;
}

//  有分组时
.snail-select-popup.has-group {}
</style>