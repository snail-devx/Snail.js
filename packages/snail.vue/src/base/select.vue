<!-- 选项菜单 组件：
    1、支持基础的html select ，支持多级选择，支持搜索功能 
    2、通过 v-model 绑定已选数据
    3、选中数据显示，支持插槽
-->
<template>
    <div class="snail-select" :class="{ 'readonly': props.readonly }" @click="onClick()" ref="select">
        <template v-if="props.items && props.items.length > 0">
            <div v-if="selectedItemsRef.length > 0" class="select-result">
                <slot :="slotOptions">
                    <div class="select-text" :title="selectedTextRef" v-text="selectedTextRef" />
                </slot>
            </div>
            <div v-else class="select-result text-tips" v-text="props.readonly ? '' : (props.placeholder || '请选择')" />
            <Icon type="arrow" :size="24" color="#8a9099" style="transform: rotate(90deg);" />
        </template>
        <div v-else class="no-items text-tips">暂无可选项</div>
    </div>
</template>

<script setup lang="ts">
import { hasAny, IAsyncScope, isArrayNotEmpty, IScope, removeFromArray, useTimer } from "snail.core";
import { computed, nextTick, useTemplateRef } from "vue";
import { usePopup } from "../popup/manager";
import Icon from "./icon.vue";
import SelectPopup from "./components/select-popup.vue";
import { ISelectContext, SelectBaseEvents, SelectEvents, SelectItem, SelectOptions, SelectPopupEvents, SelectPopupOptions, SelectSlotOptions } from "./models/select-model";
import { useSelectContext } from "./components/select-context";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SelectOptions<any>>();
const emits = defineEmits<SelectEvents<any>>();
const valuesModel = defineModel<SelectItem<any>[] | SelectItem<any>>();
const { follow } = usePopup();
const { onTimeout } = useTimer();
/** 组件根元素*/
const rootDom = useTemplateRef("select");
/** 已选数据：外部可能传入单个选项，需要转成数组 */
const selectedItemsRef = computed(() => valuesModel.value
    ? Array.isArray(valuesModel.value) ? valuesModel.value : [valuesModel.value]
    : []
);
/** 【选项菜单】上下文 */
const context: ISelectContext<any> = useSelectContext<any>(props.items, selectedItemsRef);
/** 选择的结果文本 */
const selectedTextRef = computed(() => context.selectedText(props.multiple, props.showPath));
/** 插槽配置选项 */
const slotOptions = Object.freeze<SelectSlotOptions>({ clear });
/** 跟随弹窗作用域 */
var followScope: IAsyncScope<SelectItem<any>[]> = undefined;
/** 停止事件冒泡的作用域对象 */
var stopPropagationScope: IScope = undefined;
//  2、可选配置选项
defineOptions({ name: "Select", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 更新选择项控件值
 * - 只有值真的改变时，才更新，并发送change事件
 * @param newValue      新值 
 * @param eventValues   change事件的发送值：单选时为选项路径，多选时为多个选择项
 */
function updateModelValue(newValue: SelectItem<any> | SelectItem<any>[], eventValues: SelectItem<any>[]) {
    if (valuesModel.value != newValue) {
        valuesModel.value = newValue;
        nextTick(() => emits("change", eventValues));
    }
}
/**
 * 是否是单个值
 */
function isSingleValue(): boolean {
    return props.multiple != true && props.valuePathDisabled == true;
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
    updateModelValue(isSingleValue() ? undefined : [], []);
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
    //  构建已选数据：单选时，仅取最后一个选择节点
    const values: SelectItem<any>[] = [...selectedItemsRef.value];
    props.multiple != true && values.length > 1 && values.splice(0, values.length - 1);
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
    //  多选时，切换选中状态；单选时直接返并触发选择事件
    if (props.multiple == true) {
        const node = path[path.length - 1];
        if (node) {
            path = [...selectedItemsRef.value]
            removeFromArray(path, node) == -1 && path.push(node);
            updateModelValue(path, path);
        }
    }
    //  单选时：判断是取单个，还是保留数组
    else {
        const newValue = isSingleValue() ? path[path.length - 1] : path;
        updateModelValue(newValue, path);
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<script lang="ts">
import { onAppCreated } from "./utils/app-util";
import { EventsType } from "../exporter";
//  非组件实例逻辑：将【选项弹窗】注册为【弹窗】app实例的全局组件，方便树形复用
onAppCreated((app, type) => {
    type == "popup" && app.component("SelectPopup", SelectPopup);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-select {
    background-color: white;
    width: 100%;
    height: 32px;
    border: 1px solid #dddfed;
    border-radius: 4px;
    cursor: pointer;
    color: #2e3033;
    //  flex 布局：display: flex，align-items 为center
    .flex-cross-center();

    //  已选结果区域
    >div.select-result {
        height: 30px;
        flex: 1;
        overflow: hidden;
        padding: 0 10px 0 6px;
        //  flex 布局：display: flex，align-items 为center
        .flex-cross-center();
        flex-wrap: nowrap;

        >div.select-text {
            //  文本溢出时出省略号
            .text-ellipsis();
        }
    }

    >svg.snail-icon {
        flex-shrink: 0;
        margin-right: 4px;
    }

    //  无数据提醒
    >div.no-items {
        width: 100%;
        height: 100%;
        padding: 0 8px;
        cursor: text;
        //  flex 布局：display: flex，align-items 为center
        .flex-cross-center();
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  只读样式适配
.snail-select.readonly {
    cursor: auto;

    >svg.snail-icon {
        display: none;
    }
}
</style>