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
            <div v-else-if="props.multiple" class="select-result multi" v-text="selects!.join('、')"
                :title="selects!.join('、')" />
            <div v-else class="select-result single" :title="selects!.map(item => item.text).join('-')">
                <template v-for="(item, index) in selects">
                    <div class="result-item" :class="[`item-${index + 1}`]" v-text="item.text" />
                    <div class="divider" v-if="selects!.length > 1 && index + 1 != selects!.length" />
                </template>
            </div>
            <Icon v-if="props.delete && isArrayNotEmpty(selects)" type="close" :size="20" color="#8a9099"
                @click="onDeleteSelects" />
            <Icon type="arrow" :size="24" color="#8a9099" style="transform: rotate(90deg);" />
        </template>
        <!-- 无选项时的适配：提示无选项。。。 -->
        <div v-else class="no-items text-tips">暂无可选项</div>
    </div>
</template>

<script setup lang="ts">
import { shallowRef, useTemplateRef } from "vue";
import Icon from "../src/base/icon.vue";
import { Select2Item, Select2Events, Select2Options, Select2PopupOptions, Select2BaseEvents, Select2Node } from "./select2-model";
import SelectPopup from "./select2-popup.vue";
import { usePopup } from "../src/popup/manager";
import { hasAny, IAsyncScope, isArrayNotEmpty, IScope } from "snail.core";
import { buildSelectNodes, refreshSelectNodes } from "./select-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<Select2Options<any>>();
const emits = defineEmits<Select2Events<any>>();
const valuesModel = defineModel<Select2Item<any>[]>({ default: [] });
const { follow } = usePopup();
/** 【选择项】节点集合 */
const selectNodes: Readonly<Select2Node<any>[]> = Object.freeze(buildSelectNodes(props.items));
/** 组件根元素*/
const rootDom = useTemplateRef("select");
/** 是否是【删除】选择项按钮点击了 */
var isDeleteItemClicked: boolean = false;
/** 已选结果数据 */
const selects = shallowRef<Select2Item<any>[]>();
/** 跟随弹窗作用域 */
var followScope: IAsyncScope<Select2Item<any>[]> = undefined!;
//  2、可选配置选项
defineOptions({ name: "Select2", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 选项菜单 点击时
 * - 弹出选择项
 */
async function onClick() {
    if (isDeleteItemClicked == true || props.readonly == true || rootDom.value == undefined) {
        return;
    }
    //  已存在则销毁
    if (followScope != undefined) {
        followScope.destroy();
        followScope = undefined!;
        return;
    }
    //  构建已选数据：单选时，仅取最后一个选择节点
    const values: Select2Item<any>[] = valuesModel.value && valuesModel.value.length > 0
        ? [...valuesModel.value]
        : [];
    props.multiple != true && values.length > 1 && values.splice(0, values.length - 1);
    //  打开弹窗：跟随宽度，并在合适时机关闭掉
    followScope = follow(rootDom.value, {
        // component: shallowRef(SelectPopup),
        name: "Select2Popup",
        followWidth: true,
        followX: "start",
        spaceClient: 10,
        spaceY: 2,

        closeOnMask: true,
        closeOnResize: true,
        closeOnTarget: true,

        props: Object.freeze(Object.assign<Select2PopupOptions<any>, Record<string, any>>(
            //  弹窗配置选项：将选项解构，避免响应式干扰
            {
                items: refreshSelectNodes(selectNodes, values),
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
    followScope = undefined!;
}
/**
 * 删除已选【选择项】
 * - 进行变量标记，不能直接stop事件冒泡，否则会影响全局监听的click事件
 */
function onDeleteSelects() {
    isDeleteItemClicked = true;
    setTimeout(() => isDeleteItemClicked = false, 0);
    onSelectItemChange([]);
}
/**
 * 选项改变时
 * @param items 
 */
function onSelectItemChange(items: Select2Item<any>[]) {
    items = hasAny(items) ? [...items] : [];
    selects.value = items;
    valuesModel.value = items;
    emits("change", items);
}

// *****************************************   👉  组件渲染    *****************************************
//  未支持，先报错，后期再后话
if (props.multiple == true) {
    throw new Error("暂时还没支持【多选】操作");
}
</script>

<script lang="ts">
import { onAppCreated } from "../src/base/utils/app-util";
//  非组件实例逻辑：将【选项弹窗】注册为【弹窗】app实例的全局组件，方便树形复用
onAppCreated((app, type) => {
    type == "popup" && app.component("Select2Popup", SelectPopup);
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

        >div.text-tips {}

        //  单选模式
        &.single>.result-item> {
            flex: auto;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        //  单选 选项之间的分隔符，简化处理，有需求各自定制
        &.single>.divider {
            width: 7px;
            height: 1px;
            flex-shrink: 0;
            background-color: gray;
            margin: 0 4px;
        }

        //  多选模式
    }

    >svg.snail-icon:last-child {
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