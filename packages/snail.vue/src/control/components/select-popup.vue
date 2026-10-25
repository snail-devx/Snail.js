<!-- 选项菜单 弹窗组件
    1、展示多个【选择项】，支持分组、多级别
    2、最多展示两级，若为分组节点，则展示 分组+子选项
    3、若为item节点，则展示item
    4、配合 ../select.vue 使用，无法独立使用
    5、搜索框需要搜索时，对外发送事件，由【../select.vue】完成搜索处理，并更新选项数据
-->
<template>
    <div class="snail-select-popup" :class="classRef" :style="popupStyle" @mouseenter="onEnterPopup"
        @mouseleave="onLeavePopup">
        <template v-if="classRef['child-popup'] && classRef['placeholder']">
            暂无选项
        </template>
        <template v-else>
            <Search v-if="search" :="search" @search="onSearch" key="select-search" />
            <SelectNode v-for="item in itemsRef" :key="context.getKey(item)" :multiple="multiple" :item="item"
                :context="context" :show-children="true" @enter="onEnterSelectNode" @click="onClickSelectNode" />
            <Empty v-if="itemsRef.length == 0" :message="'无结果'" />
            <!-- 清空已选：仅在第一级弹层中展示，且需有已选【选择项】时 -->
            <div class="clear-all" v-if="showClearButtonRef" @click="onClearAllClick">
                清空已选
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { IAsyncScope, isArrayNotEmpty, IScope, isStringNotEmpty, useTimer } from "snail.core";
import { computed, shallowRef, ShallowRef } from "vue";
import { useReactive } from "../../base/reactive";
import { usePopup } from "../../popup/manager";
//  依赖的其他vue组件
import Empty from "../../prompt/empty.vue";
import Search from "../search.vue";
import SelectNode from "./select-node.vue";
//  使用到的数据类型
import { FollowExtend, FollowHandle } from "../../popup/models/follow-model";
import { SelectItem, SelectPopupEvents, SelectPopupExtend, SelectPopupOptions } from "../models/select-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SelectPopupOptions<any> & SelectPopupExtend & FollowHandle<SelectItem<any>[]> & FollowExtend>();
const emits = defineEmits<SelectPopupEvents<any>>();
const { follow } = usePopup();
const { onTimeout } = useTimer();
const { watcher } = useReactive();
//      解构一些响应式变量，方便访问
const { context, popupStatus, pinned, parentPinned } = props;
/**     能够展示的【选择项】：需要【补丁】节点 */
const itemsRef = computed(() => (props.items || []).filter(item => context.isShow(item, true)));
/**     弹窗所需的类样式信息 */
const classRef = computed(() => ({
    /** 子【选择项】弹窗 */
    'child-popup': props.level > 1,
    /** 无【选择项】的文本提示区域 */
    'placeholder': itemsRef.value.length == 0,
    /** 【选择项】中是否存在分组 */
    "has-group": itemsRef.value.find(node => node.type == "group") != undefined,
}));
/**     当前弹窗时的鼠标状态 */
var mouseStatus: "Enter" | "Leave" = "Leave";
//  2、子弹窗相关变量
/**     子【选择项】follow弹窗作用域 */
var childFollowScope: IAsyncScope<SelectItem<any>[]> = undefined;
/**     子【选择项】follow弹窗跟随的目标元素 */
var childFollowTargetDom: HTMLElement = undefined;
/**     子弹窗销毁的定时器；鼠标离开弹窗时，做延迟销毁；避免回到 此弹窗 的父【选择项】时，又重新打开此弹窗*/
const childDestroyTimerRef: ShallowRef<IScope> = shallowRef(undefined);
//  3、【清空已选】按钮相关变量
/**     【清空】按钮是否点击了 */
const clearButtonClickedRef: ShallowRef<boolean> = shallowRef(false);
/**     是否需要【清空】按钮：单选时，若一开始没有选中项，则不需要（点击时，会销毁弹窗，不用显示） */
const needClearButton = props.multiple == true
    ? props.level == 1
    : props.level == 1 && isStringNotEmpty(context.selectedText(false, props.showPath));
/**     是否显示【清空】按钮：需要清空按钮、且配置了显示时；单选始终显示，多选根据是否有已选(（若点击了清空按钮，则不用隐藏了，弹窗会销毁）*/
const showClearButtonRef = computed(() => needClearButton && props.showClear && (props.multiple
    ? clearButtonClickedRef.value || context.selectedText(true, props.showPath)
    : true)
);
//  4、可选配置选项
defineOptions({ name: "Select2Popup", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 监听配置选项改变
 * - 进行合法性验证
 */
function watchOptionsChange() {
    //  多选时，不能存在 多级菜单：这个规则比较隐蔽，若不符合规则，则强制报错提示出来
    const inValid = props.multiple == true
        && itemsRef.value
        && itemsRef.value.some(item => item.children && item.children.length > 0);
    if (inValid == true) {
        const message: string = "select-popup.vue: select item cannot be multi-level when multiple == true";
        onTimeout(() => {
            props.closePopup();
            alert(message);
            throw new Error(message)
        }, 0)
    }
}
/**
 * 发送【选择项】点击事件
 * @param path 选项路径，从父->子
 */
function emitClickEvent(...path: SelectItem<any>[]) {
    if (popupStatus.value != "closed") {
        path = path.filter(item => item != undefined);
        emits("click", path);
        props.multiple || props.closePopup(path);
    }
}

/**
 * 销毁子【选择项】弹窗
 * @param onlyTimer 是否仅销毁 子的定时器；false时全部销毁
 */
function destroyChildFollow(onlyTimer?: boolean) {
    //  取消子弹窗的销毁逻辑
    childDestroyTimerRef.value && childDestroyTimerRef.value.destroy();
    childDestroyTimerRef.value = undefined;
    //  销毁子弹窗
    if (onlyTimer != true && childFollowScope && childFollowScope.destroyed == false) {
        childFollowScope.destroy();
        childFollowScope = undefined;
        childFollowTargetDom = undefined;
    }
}

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
 * 搜索选项时
 * @param text 
 */
function onSearch(text: string) {
    //  搜索时，先将弹出的子弹窗关闭掉；否则搜索未匹配子弹窗时，会存在效果漂移问题；后续考虑优化，此种情况，Follow弹窗应立即销毁
    destroyChildFollow();
    context.doSearch(text);
}

/**
 * 鼠标进入【选择项】
 */
async function onEnterSelectNode(target: HTMLDivElement, node: SelectItem<any>, parent?: SelectItem<any>) {
    //  非【打开】状态，不响应：点击【选择项】关闭当前弹窗时，异步销毁过程中，鼠标移动到其他【选择项】了，此时不能再打开了
    if (popupStatus.value == "closed") {
        return;
    }
    //  目前还有子弹窗存在时：target和之前的子弹窗选项 target 一致时，不用重复弹窗；否则销毁之前弹窗，再弹出新的
    if (childFollowScope && childFollowScope.destroyed == false) {
        const isSameTarget = target == childFollowTargetDom;
        destroyChildFollow(isSameTarget);
        if (isSameTarget == true) {
            return;
        }
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
                multiple: props.multiple,
                level: props.level + 1,
                popupStyle: props.popupStyle,

                childDestroyTimer: childDestroyTimerRef,
                parentPinned: pinned,
            }),
        });
        //  等待弹窗结束，如果有选中项，则对外分发
        const datas = await childFollowScope;
        isArrayNotEmpty(datas) && emitClickEvent(parent ? parent : undefined, node, ...datas);
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
    node.clickable && emitClickEvent(parent ? parent : undefined, node);
}
/**
 * 清空已选【选择项】
 * - 发送改变事件，并关闭弹窗
 */
function onClearAllClick() {
    emits("clear");
    clearButtonClickedRef.value = true;
    props.closePopup([]);
}

// *****************************************   👉  组件渲染    *****************************************
//  监听【选项】变动，进行事件验证
{
    watcher(() => props.multiple, watchOptionsChange);
    watcher(itemsRef, watchOptionsChange);
    watchOptionsChange();
}
//  监听【pinned】变化，当前弹窗【钉住】了，则父级弹窗同步【钉住】
watcher(pinned, newValue => newValue == true && parentPinned && (parentPinned.value = true));
//  监听【popupStatus】变化，同步销毁子级弹窗：usePopup会自定管理子弹窗销毁，但为异步有延迟，这里更为即时
watcher(popupStatus, newValue => newValue == "closed" && childFollowScope && childFollowScope.destroy());
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-select-popup {
    max-height: 90%;
    min-height: 32px;
    overflow: auto;
    background: #fff;
    box-shadow: 0px 1px 5px 1px #dddfed;
    border: 1px solid #dddfed;
    border-radius: 4px;
    //  取消底部的内边距
    // padding-bottom: 6px;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    >div.snail-search {
        margin: 12px;
    }

    //  清空已选
    >div.clear-all {
        flex-shrink: 0;
        height: 32px;
        border-top: 1px solid #dddfed;
        cursor: pointer;
        color: #8a9099;
        padding: 0 12px;
        //  始终在最后展示
        position: sticky !important;
        bottom: 0;
        z-index: 1;
        background-color: white;
        //  flex 布局：display: flex，align-items 为center
        .flex-cross-center();

        &:hover {
            color: #ff4c4c;
        }
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  子的选项弹窗：无选项时显示【无选项】
.snail-select-popup.child-popup {
    min-width: 200px;
    max-width: 250px;
    padding-top: 6px;
    padding-bottom: 6px;

    //  无可用选项
    &.placeholder {
        padding: 0 12px;
        width: 100px !important;
        justify-content: center;
    }
}

//  有分组时
// .snail-select-popup.has-group {}
</style>