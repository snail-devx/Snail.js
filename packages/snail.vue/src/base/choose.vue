<!-- 选择 组件：不作为表单组件对外提供
    1、支持单选、复选样式
    2、支持多个选项，选项多选或者单选
    3、支持选项指定文本，宽度，边距等
-->
<template>
    <div class="snail-choose" :class="readonly ? 'readonly' : ''">
        <div v-for="(node, index) in chooseItemsRef" :key="getKey(node.item)" class="choose-item"
            :class="node.checked ? 'checked' : ''" :style="css.buildStyle(itemStyle)" @click="onItemClick(node, index)">
            <input v-if="mode == 'native'" :type="type" :checked="node.checked" />
            <div v-else-if="mode == 'beautiful'" class="item-beautiful"
                :class="[type, node.checked ? 'item-checked' : 'item-unchecked']">
                <Icon v-if="node.checked" :type="'success'" :size="12" :color="readonly ? '#8a9099' : 'white'" />
            </div>
            <span class="item-text" v-if="node.item.text" v-text="node.item.text" />
            <span class="item-des" v-if="node.item.description" v-text="node.item.description" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, nextTick } from "vue";
import { newId, isArray, useKey } from "snail.core";
import { css } from "snail.view";
import { ChooseOptions, ChooseEvents, ChooseItem } from "./models/choose-model";
import Icon from "./icon.vue";

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
    checked: boolean;
}

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ChooseOptions<any>>();
const emits = defineEmits<ChooseEvents<any>>();
const { mode = "native" } = props;
const { getKey } = useKey<ChooseItem<any>>();
/**     双向绑定数据值：多选时，若传入的非数组，则强制转为空数组 */
const valuesModel = defineModel<any | any[]>({});
props.multi && isArray(valuesModel.value) == false && (valuesModel.value = []);
/**     待选项目：进行响应式计算，model值改变时，同步更新选项状态*/
const chooseItemsRef: ComputedRef<ChooseItemNode[]> = computed(() => props.items.map(item => {
    return {
        item: item,
        checked: props.multi == true
            ? (valuesModel.value as any[]).includes(item.value)
            : valuesModel.value == item.value,
    }
}));
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
    //  更新选中状态
    //      多选模式：反选
    if (props.multi == true) {
        node.checked = !node.checked;
        valuesModel.value = chooseItemsRef.value.filter(item => item.checked).map(item => item.item.value);
    }
    //      单选模式：如果是只有一个的checkbox模式，则反选（即可取消选中）
    else {
        const newChecked = props.type == "checkbox" && props.items.length == 1 ? !node.checked : true;
        chooseItemsRef.value.forEach(item => item.checked = false);
        node.checked = newChecked;
        valuesModel.value = newChecked ? node.item.value : undefined;
    }
    //  延迟change事件；外部同时使用v-model和change事件时，valueModel.value修改不会立马生效
    nextTick(() => emits("change", valuesModel.value));
}
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-choose {
    overflow-x: hidden;
    //  flex 布局：display: flex，align-items 为center
    .flex-cross-center();
    flex-wrap: wrap;

    >div.choose-item {
        position: relative;
        flex-shrink: 0;
        cursor: pointer;
        margin: 0 8px;
        user-select: none;
        //  flex 布局：display: flex，align-items 为center
        .flex-cross-center();

        &:first-child {
            margin-left: 0;
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

        //  原生模式时，使用input
        >input::checkmark {
            background-color: #2196F3;
            /* 修改为你想要的背景色 */
            border-color: #2196F3;
        }

        //  美化样式
        >div.item-beautiful {
            flex-shrink: 0;
            overflow: hidden;
            //  flex 布局：display: flex，align-items、justify-content 都为center
            .flex-center();

            //  单选框样式
            &.radio {
                width: 16px;
                height: 16px;
                border-radius: 50%;
            }

            &.checkbox {
                width: 14px;
                height: 14px;
            }

            &.item-unchecked {
                border: solid 1px #8a9099;
            }

            // 选中样式
            &.item-checked {
                border: solid 1px #4c9aff;
                background-color: #4c9aff;
            }
        }

        >span {
            margin-left: 4px;

            &.item-des {
                color: #8a9099;
            }
        }
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  只读时的样式适配
.snail-choose.readonly {
    >div.choose-item {
        cursor: initial;

        //  美化样式时：选中状态背景、边框色处理
        >div.item-beautiful {

            &.item-unchecked {
                opacity: 0.5;
            }

            &.item-checked {
                background-color: #d5d7db;
                border-color: #d5d7db;
            }
        }
    }
}
</style>