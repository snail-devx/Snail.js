<!-- 选择 组件：不作为表单组件对外提供
    1、支持单选、复选样式
    2、支持多个选项，选项多选或者单选
    3、支持选项指定文本，宽度，边距等
-->
<template>
    <div class="snail-choose" :class="[type, mode, layout, readonly ? 'readonly' : '']">
        <div v-for="(node, index) in chooseItemsRef" :key="getKey(node.item)" class="choose-item"
            :class="node.selected ? 'selected' : ''" :style="css.buildStyle(itemStyle)" :title="node.item.text"
            @click="onItemClick(node, index)">
            <!-- 选项样式：radio、checkbox -->
            <input v-if="mode == 'native'" :type="type" :checked="node.selected" />
            <div v-else-if="mode == 'beautiful'" class="status" :class="[node.selected ? 'selected' : '']">
                <Icon v-if="node.selected" type="success" :size="12" :color="readonly ? '#8a9099' : 'white'" />
            </div>
            <!-- 选项文本,选项描述信息 -->
            <span class="item-text" v-if="node.item.text" v-text="node.item.text" />
            <span class="item-des" v-if="node.item.description" v-text="node.item.description" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { isArray, useKey } from "snail.core";
import { css } from "snail.view";
import { computed, ComputedRef, nextTick } from "vue";
import Icon from "../base/icon.vue";
import { ChooseEvents, ChooseItem, ChooseOptions } from "./models/choose-model";

// *****************************************   👉  私有类型    *****************************************
/**
 * 选择项节点
 * - 配合vue组件使用，外部忽略
 */
type ChooseItemNode = {
    /**
     * 选项
     */
    item: ChooseItem<any>;
    /**
     * 是否选中
     */
    selected: boolean;
}

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ChooseOptions<any>>();
const emits = defineEmits<ChooseEvents<any>>();
const { mode = "native", type = "radio", layout = "horizontal" } = props;
const { getKey } = useKey<ChooseItem<any>>();
/**     双向绑定数据值：多选时，若传入的非数组，则强制转为空数组 */
const valuesModel = defineModel<any | any[]>({});
props.multi && isArray(valuesModel.value) == false && (valuesModel.value = []);
/**     待选项目：进行响应式计算，model值改变时，同步更新选项状态*/
const chooseItemsRef: ComputedRef<ChooseItemNode[]> = computed(() => props.items.map(item => ({
    item: item,
    selected: props.multi == true
        ? (valuesModel.value as any[]).includes(item.value)
        : valuesModel.value == item.value,
}) as ChooseItemNode));
//  2、可选配置选项
defineOptions({ name: "Choose", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 选项点击时
 */
function onItemClick(node: ChooseItemNode, index: number) {
    if (props.readonly == true) {
        return;
    }
    //  更新选中状态；若无值变化，则不用进行改变事件触发了
    //      多选模式：反选，点击时肯定改变了
    if (props.multi == true) {
        node.selected = !node.selected;
        valuesModel.value = chooseItemsRef.value.filter(item => item.selected).map(item => item.item.value);
    }
    //      单选模式：如果是只有一个的checkbox模式，则反选（即可取消选中）
    else {
        const newSelected = type == "checkbox" && props.items.length == 1 ? !node.selected : true;
        chooseItemsRef.value.forEach(item => item.selected = false);
        node.selected = newSelected;
        const newValue = newSelected ? node.item.value : undefined;
        if (valuesModel.value == newValue) {
            return;
        }
        valuesModel.value = newValue;
    }

    //  延迟change事件；外部同时使用v-model和change事件时，valueModel.value修改不会立马生效
    nextTick(() => emits("change", valuesModel.value));
}
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-choose {

    //  选项样式
    >div.choose-item {
        position: relative;
        flex-shrink: 0;
        user-select: none;
        //  flex 布局：display: flex，align-items 为center
        .flex-cross-center();

        //  非只读时，鼠标样式
        &:not(.readonly) {
            cursor: pointer;
        }

        //  原生模式时，使用input
        >input::checkmark {
            background-color: #2196F3;
            /* 修改为你想要的背景色 */
            border-color: #2196F3;
        }

        //  选项文本、选项描述信息
        >span {
            margin-left: 4px;

            &.item-des {
                color: #8a9099;
            }
        }

        >.item-text {
            color: #2e3033;
        }

        //  使用伪类遮住选项和文本，由全局控制点击事件
        &::after {
            position: absolute;
            content: "";
            //  left、right起始位置：left: 0; top: 0
            .left-top-start();
            //  width:100%；height:100%；overflow: hidden
            .wh-fill-hidden();
        }
    }
}

//  选项水平布局
&.snail-choose.horizontal {
    overflow-x: hidden;
    //  flex 布局：display: flex，align-items 为center
    .flex-cross-center();
    flex-wrap: wrap;

    >div.choose-item {
        margin: 0 8px;

        &:first-child {
            margin-left: 0;
        }
    }
}

//  选项垂直布局
&.snail-choose.vertical {
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();
    justify-content: center;
}

//  美化模式下 选项适配：仅需要适配 status 选项状态效果
.snail-choose.beautiful {
    >.choose-item>.status {
        flex-shrink: 0;
        overflow: hidden;
        //  flex 布局：display: flex，align-items、justify-content 都为center
        .flex-center();

        // 选中样式
        &.selected {
            border: solid 1px #4c9aff;
            background-color: #4c9aff;
        }

        // 未选中样式
        &:not(.selected) {
            border: solid 1px #dcdfe6;
        }
    }

    //  美化模式下 单选选项 效果适配
    &.radio>.choose-item>.status {
        width: 16px;
        height: 16px;
        border-radius: 50%;
    }

    //  美化模式下 复选选项 效果适配
    &.checkbox>.choose-item>.status {
        width: 14px;
        height: 14px;
    }

    //  只读样式适配
    &.readonly>.choose-item>.status {
        &.selected {
            background-color: #d5d7db;
            border-color: #d5d7db;
        }

        &:not(.selected) {
            opacity: 0.5;
        }
    }
}
</style>