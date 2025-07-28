<!-- 选择 组件：不作为表单组件对外提供
    1、支持单选、复选样式
    2、支持多个选项，选项多选或者单选
    3、支持选项指定文本，宽度，边距等
-->
<template>
    <div class="snail-choose" :class="props.readonly ? 'readonly' : ''">
        <div v-for="(item, index) in chooseItemsRef" :key="newId()" class="choose-item"
            :class="item.checked ? 'checked' : ''" :style="css.buildStyle(props.itemStyle)"
            @click="onItemClick(item, index)">
            <input :type="props.type" :checked="item.checked" />
            <span v-if="item.text" v-text="item.text" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef } from "vue";
import { newId, isArray } from "snail.core";
import { css } from "snail.view";
import { ChooseOptions, ChooseEvents, ChooseItem } from "./models/choose-model";

// *****************************************   👉  私有类型    *****************************************
/**
 * 选择项详情
 * - 配合vue组件使用，外部忽略
 */
type ChooseItemDetail = ChooseItem<any> & {
    /**
     * 是否选中
     */
    checked: boolean;
}

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ChooseOptions<any>>();
const emits = defineEmits<ChooseEvents<any>>();
/**     双向绑定数据值：多选时，若传入的非数组，则强制转为空数组 */
const valuesModel = defineModel<any | any[]>({});
props.multi && isArray(valuesModel.value) == false && (valuesModel.value = []);
/**     待选项目：进行响应式计算，model值改变时，同步更新选项状态*/
const chooseItemsRef: ComputedRef<ChooseItemDetail[]> = computed(() => props.items.map(item => {
    return {
        ...item,
        checked: props.multi == true
            ? (valuesModel.value as any[]).includes(item.value)
            : valuesModel.value == item.value
    }
}));
//  2、可选配置选项
defineOptions({ name: "Choose", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 选项点击时
 */
function onItemClick(item: ChooseItemDetail, index: number) {
    if (props.readonly == true) {
        return;
    }
    //  更新选中状态
    //      多选模式
    if (props.multi == true) {
        item.checked = !item.checked;
        valuesModel.value = chooseItemsRef.value.filter(item => item.checked).map(item => item.value);
    }
    //      单选模式
    else {
        chooseItemsRef.value.forEach(item => item.checked = false);
        item.checked = true;
        valuesModel.value = item.value;
    }
    //  发送事件做通知
    emits("change", valuesModel.value);
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

        //  使用伪类遮住选项和文本，由全局控制点击事件
        &::after {
            position: absolute;
            content: "";
            //  left、right起始位置：left: 0; top: 0
            .left-right-start();
            //  width:100%；height:100%；overflow: hidden
            .wh-fill-hidden();
        }

        >input::checkmark {
            background-color: #2196F3;
            /* 修改为你想要的背景色 */
            border-color: #2196F3;
        }

        >span {
            margin-left: 4px;
        }
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  只读时的样式适配
.snail-choose.readonly {
    >div.choose-item {
        cursor: not-allowed;
    }
}
</style>