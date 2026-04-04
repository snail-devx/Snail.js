<!-- 选项菜单 组件：
    1、支持基础的html select ，支持多级选择，支持搜索功能 
    2、取消通过 v-model 绑定已选数据  ；在单选、多选等传递参数时，坑太多、、，都通过change传递参数
    3、选中数据显示，支持插槽
-->
<template>
    <div class="snail-select" :class="{ 'readonly': readonly, 'empty': !(items && items.length) }" @click="onClick()"
        ref="select">
        <!-- 有选项可选时的模板 -->
        <template v-if="items && items.length">
            <div v-if="selectedItemsRef.length" class="select-result">
                <slot :="slotOptions">
                    <div class="select-text ellipsis" :title="selectedTextRef" v-text="selectedTextRef" />
                </slot>
            </div>
            <div v-else class="placeholder" v-text="readonly ? '' : (placeholder || '请选择')" />
            <!-- 下拉选择图标，非只读时才显示 -->
            <Icon v-if="readonly != true" type="arrow" button :size="24" :rotate="90" />
        </template>
        <!-- 无可选项时，直接给出提示 -->
        <div v-else class="placeholder">暂无可选项</div>
    </div>
</template>

<script setup lang="ts">
import { hasAny, IAsyncScope, isArrayNotEmpty, IScope, removeFromArray, useTimer } from "snail.core";
import { computed, nextTick, ShallowRef, shallowRef, useTemplateRef } from "vue";
import { usePopup } from "../popup/manager";
import { useSelectContext } from "./components/select-context";
import Icon from "./icon.vue";
import { ISelectContext, SelectEvents, SelectItem, SelectOptions, SelectPopupEvents, SelectPopupOptions, SelectSlotOptions } from "./models/select-model";
import { } from "../base/reactive";
import { EventsType } from "../container/models/component-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SelectOptions<any>>();
const emits = defineEmits<SelectEvents<any>>();
const { follow } = usePopup();
const { onTimeout } = useTimer();
/** 组件根元素*/
const rootDom = useTemplateRef("select");
/** 已选数据：外部可能传入单个选项，需要转成数组 */
const selectedItemsRef: ShallowRef<SelectItem<any>[]> = shallowRef(Array.isArray(props.value)
    ? [...props.value]
    : []
);
/** 【选项菜单】上下文 */
const context: ISelectContext<any> = useSelectContext<any>(props.items, selectedItemsRef, props.separator);
/** 选择的结果文本 */
const selectedTextRef = computed(() => context.selectedText(props.multiple, props.showPath));
/** 插槽配置选项 */
const slotOptions = Object.freeze<SelectSlotOptions>({ clear });
/** 跟随弹窗作用域 */
var followScope: IAsyncScope<SelectItem<any>[]> = undefined;
/** 停止事件冒泡的作用域对象 */
var stopPropagationScope: IScope = undefined;
/** 是否是手工改变值 */
// var isManualChangeValue: boolean = false;
//  2、可选配置选项
defineOptions({ name: "Select", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 更新选中值
 * - 只有值真的改变时，才更新，并发送change事件
 * @param values 已选值；单选时，为【选择项】路径（父->子）；其他情况为已选的【选择项】
 */
function updateSelectedItems(values: SelectItem<any>[]) {
    values = values || [];
    //  判断是否真的改变了：数量不对，恒改变；数量对了，判断内容是否一致
    var isChange: boolean = true;
    if (values.length == (selectedItemsRef.value || []).length) {
        isChange = false;
        for (let index = 0; index < values.length; index++) {
            isChange = values[index] != selectedItemsRef.value[index];
            if (isChange) {
                break;
            }
        }
    }
    //  更新并发送事件：selectedItemsRef值做解构，避免外部修改数组影响内部结构
    if (isChange == true) {
        selectedItemsRef.value = [...values];
        nextTick(() => emits("change", values));
    }
}

/**
 * 销毁Follow弹窗
 * - 将隐藏已弹出的选项 follow 弹窗
 * @returns 已弹出则销毁成功返回true；未弹出则销毁失败返回false
 */
function destroyFollow(): boolean {
    if (followScope != undefined) {
        followScope.destroy();
        followScope = undefined;
        return true;
    }
    return false;
}
/**
 * 清空已选【选择项】
 * @param closeFollow 是否关闭【选择项】Follow弹窗
 * @param stopPropagation 是否停止事件冒泡
 */
function clear(closeFollow: boolean, stopPropagation: boolean): void {
    //  销毁弹窗
    closeFollow && destroyFollow();
    //  停止事件冒泡
    stopPropagationScope && stopPropagationScope.destroy();
    stopPropagationScope = stopPropagation
        ? onTimeout(() => stopPropagationScope = undefined, 200)
        : undefined;
    //  更新值
    updateSelectedItems([]);
}

/**
 * 选项菜单 点击时
 * - 弹出选择项
 */
async function onClick() {
    //  只读等情况时，不响应点击事件
    if (props.readonly == true || rootDom.value == undefined || isArrayNotEmpty(props.items) == false) {
        return;
    }
    //  已存在则销毁；处于停止冒泡时，不做响应
    if (destroyFollow() == true || stopPropagationScope != undefined) {
        return;
    }
    //  打开弹窗：跟随宽度，并在合适时机关闭掉
    context.doSearch(undefined);
    followScope = follow<any, SelectPopupOptions<any> & EventsType<SelectPopupEvents<any>>>(rootDom.value, {
        name: "SelectPopup",
        followWidth: true,
        followX: "start",
        spaceClient: 10,
        spaceY: 2,

        closeOnMask: true,
        closeOnResize: true,
        closeOnTarget: true,

        props: {
            // 弹窗属性
            items: props.items,
            context: context,
            level: 1,
            search: props.search,
            multiple: props.multiple,
            showClear: props.showClear,
            popupStyle: props.popupStyle,
            //  事件监听
            //      选项点击事件
            onClick: onSelectItemClick,
            //      【清除】按钮点击事件；清理后关闭弹窗
            onClear: () => clear(true, false)
        }
    });
    await followScope;
    followScope = undefined;
}
/**
 * 选项点击时
 * @param path 选项路径；父->子 
 */
function onSelectItemClick(path: SelectItem<any>[]) {
    path = hasAny(path) ? [...path] : [];
    //  多选时，切换选中状态；计算出当前选中的所有选项
    if (props.multiple == true) {
        const node = path[path.length - 1];
        if (node) {
            path = [...selectedItemsRef.value]
            removeFromArray(path, node) == -1 && path.push(node);
        }
    }
    updateSelectedItems(path);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听

//  2、生命周期响应

</script>

<script lang="ts">
import SelectPopup from "./components/select-popup.vue";
import { onAppCreated } from "./utils/app-util";
//  非组件实例逻辑：将【选项弹窗】注册为【弹窗】app实例的全局组件，方便树形复用
onAppCreated((app, type) => {
    type == "popup" && app.component("SelectPopup", SelectPopup);
});
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-select {
    width: 100%;
    height: 32px;
    border: 1px solid #dddfed;
    border-radius: 4px;
    color: #2e3033;
    //  flex 布局：display: flex，align-items 为center
    .flex-cross-center();

    //  只读时不显示背景颜色，直接透明
    &:not(.readonly) {
        background-color: white;
    }

    //  有选项非只读时，显示可点击手型效果
    &:not(.readonly, .empty) {
        cursor: pointer;
    }

    //  已选结果区域
    >div.select-result {
        flex: 1;
        padding: 0 10px 0 6px;
        height: 30px;
        overflow: hidden;
        //  flex 布局：display: flex，align-items 为center
        .flex-cross-center();
        flex-wrap: nowrap;
    }

    //  未选选项时的提示效果
    >div.placeholder {
        flex: 1;
        padding: 0 10px 0 6px;
    }

    //  下拉选择标记图标
    >svg.snail-icon {
        flex-shrink: 0;
        margin-right: 4px;
    }

    //  无数据提醒
    >div.no-items {
        flex: 1;
        padding: 0 8px;
    }
}
</style>