<!-- 选项菜单 组件：
    1、支持基础的html select ，支持多级选择，支持搜索功能 
    2、通过 v-model 绑定已选数据
-->
<template>
    <div class="snail-select" :class="{ 'readonly': props.readonly }" @click="onClick()" ref="select">
        <template v-if="props.items && props.items.length > 0">
            <!-- 展示选择结果数据：无数据时显示placeholder；多选和单选区分开-->
            <div v-if="isArrayNotEmpty(selects) == false" class="select-result text-tips"
                v-text="props.placeholder || '请选择'" />
            <div v-else class="select-result" :title="selectText">
                <div class="select-text" v-text="selectText">
                </div>
            </div>
            <Icon type="arrow" :size="24" color="#8a9099" style="transform: rotate(90deg);" />
        </template>
        <!-- 无选项时的适配：提示无选项。。。 -->
        <div v-else class="no-items text-tips">暂无可选项</div>
    </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from "vue";
import Icon from "./icon.vue";
import SelectPopup from "./components/select-popup.vue";
import { usePopup } from "../popup/manager";
import { hasAny, IAsyncScope, isArrayNotEmpty } from "snail.core";
import { SelectEvents, SelectItem, SelectOptions, SelectPopupOptions } from "./models/select-model";
import { ITreeContext } from "./models/tree-base";
import { useTreeContext } from "./components/tree-context";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SelectOptions<any>>();
const emits = defineEmits<SelectEvents<any>>();
const valuesModel = defineModel<SelectItem<any>[]>({ default: [] });
const { follow } = usePopup();
/** 树上下文 */
const context: ITreeContext<any> = useTreeContext<any>(props.items);
/** 组件根元素*/
const rootDom = useTemplateRef("select");
/** 已选结果数据 */
const selects = shallowRef<SelectItem<any>[]>();
/** 选择的结果文本 */
const selectText = computed(() => hasAny(selects.value)
    ? (props.multiple == true || props.showPath == true
        ? selects.value.map(item => item.text).join(props.multiple ? "、" : " / ")
        : selects.value[selects.value.length - 1].text
    )
    : ""
);
/** 跟随弹窗作用域 */
var followScope: IAsyncScope<SelectItem<any>[]> = undefined;
//  2、可选配置选项
defineOptions({ name: "Select", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 选项菜单 点击时
 * - 弹出选择项
 */
async function onClick() {
    if (props.readonly == true || rootDom.value == undefined) {
        return;
    }
    //  已存在则销毁
    if (followScope != undefined) {
        followScope.destroy();
        followScope = undefined;
        return;
    }
    //  构建已选数据：单选时，仅取最后一个选择节点
    const values: SelectItem<any>[] = valuesModel.value && valuesModel.value.length > 0
        ? [...valuesModel.value]
        : [];
    props.multiple != true && values.length > 1 && values.splice(0, values.length - 1);
    //  打开弹窗：跟随宽度，并在合适时机关闭掉
    context.doSearch(undefined);
    followScope = follow(rootDom.value, {
        name: "SelectPopup",
        followWidth: true,
        followX: "start",
        spaceClient: 10,
        spaceY: 2,

        closeOnMask: true,
        closeOnResize: true,
        closeOnTarget: true,

        props: Object.freeze(Object.assign<SelectPopupOptions<any>, Record<string, any>>(
            //  弹窗配置选项：将选项解构，避免响应式干扰
            {
                items: props.items,
                context: context,
                level: 1,
                search: props.search,
                multiple: props.multiple,
                values: [...valuesModel.value],
                popupStyle: props.popupStyle,
            },
            //  事件监听、例外属性处理
            {
                onChange: onSelectItemChange,
            }
        )),
    });
    await followScope;
    followScope = undefined;
}
/**
 * 选项改变时
 * @param items 
 */
function onSelectItemChange(items: SelectItem<any>[]) {
    items = hasAny(items) ? [...items] : [];
    selects.value = items;
    valuesModel.value = items;
    emits("change", items);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<script lang="ts">
import { onAppCreated } from "./utils/app-util";
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
        padding: 0 8px;
        cursor: text;
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