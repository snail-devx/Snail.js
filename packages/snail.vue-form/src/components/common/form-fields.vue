<!-- 表单字段集合；作为字段容器存在，负责多个字段的渲染工作
    1、支持表单设计时、运行时渲染字段
    2、内部不控制高度和宽度，由外部自己控制
    3、仅作为表单中的字段容器使用 -->
<template>
    <div class="snail-form-fields" :class="[`tc-${global.columns}`, global.mode,]">
        <!-- 这个key使用字段id可能有问题，后续再考虑优化，特别是运行时的时候；设计时构建 复制、删除 按钮 -->
        <Sort draggable=".field-item" :changer="fields.length" :group="global.global" :disabled="global.readonly"
            @add="onDragAddField" @update="container.moveField">
            <div v-for="(field, index) in fields" class="field-item" :class="`fw-${getFieldWidth(field)}`"
                :key="field.id" @click="console.log('click')">
                <!-- <div class="field-component">{{ field.title }}</div> -->
                <Dynamic class="field-body" :key="field.id" :="buildFieldRenderOptions(field)" />
                <!-- 设计时的盖板：显示复制、删除 -->
                <div class="field-cover" v-if="global.mode == 'design'" @click="onActiveField(field, index)">
                    <Icon type="plus" color="#aeb6c2" hover-color="#279bf1" title="复制"
                        @click="isButtonClickInCover = true, container.copyField(field, index)" />
                    <Icon type="trash" color="#aeb6c2" hover-color="#279bf1" title="删除"
                        @click="isButtonClickInCover = true, container.deleteField(field, index)" />
                </div>
            </div>
        </Sort>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, } from "vue";
import { isStringNotEmpty, } from "snail.core";
import { components, SortEvent } from "snail.vue";
import { FieldContainerEvents, FieldContainerOptions, FieldOptions, } from "../../models/field-model";
import { } from "../../models/form-model";
import { INJECTKEY_GlobalContext, useFieldContainer } from "./field-share";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldContainerOptions>();
const { Sort, Icon, Dynamic } = components;
const _emits = defineEmits<FieldContainerEvents>();
/**     字段全局上下文 */
const global = inject(INJECTKEY_GlobalContext);
/**     字段容器对象；负责接管字段容器组件部分逻辑，减少vue组件中的非渲染代码 */
const container = useFieldContainer(global, {
    ..._,
    //  在父级字段中的索引位置，可能会实时变化，这里做一下监听计算
    rowIndex: computed(() => _.rowIndex || 0).value,
}, _emits);
const { fields, buildFieldRenderOptions, } = container;
//  2、组件交互变量、常量
/**     是否时字段Cover内的按钮点击了；实现cover内部按钮点击时，不激活字段 */
let isButtonClickInCover: boolean;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 计算字段宽度
 * @param field
 */
function getFieldWidth(field: FieldOptions<any>): number {
    const width = field.width || global.defaultFieldSpan;
    return Math.max(1, Math.min(width, global.columns));
}

//#region ----- 设计时相关事件、方法
/**
 * 添加字段时
 * - 从控件列表添加字段时
 * - 从其他容器中移动过来时
 * @param evt 
 */
function onDragAddField(evt: SortEvent) {
    /**判断是添加还是移动字段
     *  1、全新添加时：evt.item 属性标记【:data-type="control.type"】
     *    1、直接执行addField即可，内部判断是否可添加
     *  2、移动字段时：evt.item 属性标记 【:data-field="control.type" :data-container="containerId"】
     *    1、判断原容器下，此字段是否可移除，不可移除则不能添加
     *    2、判断当前容器下，此字段是否可添加，不可添加则放回元容器中
     */
    if (evt.from !== evt.to) {
        let type: string = evt.item.getAttribute("data-type");
        let success: boolean;
        let field: FieldOptions<any>;
        //  全新添加
        if (isStringNotEmpty(type) == true) {
            container.addField(type, evt.newIndex);
        }
        //  从其他字段容器移动过来的字段；先判断是否能够删除，若能删除再添加，添加成功再从移除
        else {
            alert("移动添加还没实现呢");
        }
    }
}
/**
 * 激活字段-进入字段设置界面
 * @param field 
 * @param index 
 */
function onActiveField(field: FieldOptions<any>, index: number) {
    // 避免内部按钮点击触发时的冒泡
    if (isButtonClickInCover == true) {
        isButtonClickInCover = false;
        return;
    }
    //  发送字段激活事件
    alert("准备激活字段，进入字段设置");
}
//#endregion

// *****************************************   👉  接口实现    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-form-fields {
    position: relative;
    display: flex;
    align-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;

    >.field-item {
        flex-shrink: 0;
        position: relative;
        overflow-x: hidden;
        min-height: 30px;

        >.field-body {}
    }
}

// *****************************************   👉  特定样式适配    *****************************************
//  字段宽度样式：不同总列数下，平分宽度
.snail-form-fields {
    &.tc-1>.field-item {
        width: 100%;
    }

    //  总列数为2（一行两列）
    &.tc-2>.field-item {
        &.fw-1 {
            width: 50%;
        }

        &.fw-2 {
            width: 100%;
        }
    }

    //  总列数为3（一行三列）
    &.tc-3>.field-item {
        &.fw-1 {
            width: calc(100% / 3);
        }

        &.fw-2 {
            width: calc(200% / 3);
        }

        &.fw-3 {
            width: 100%;
        }
    }

    //  总列数为4（一行四列）
    &.tc-4>.field-item {
        &.fw-1 {
            width: 25%;
        }

        &.fw-2 {
            width: 50%;
        }

        &.fw-3 {
            width: 75%;
        }

        &.fw-4 {
            width: 100%;
        }
    }
}

//  设计时的适配
.snail-form-fields.design {
    /* 设计时；按照字段自身高度，不撑开，避免 field-cover 高度太高影响效果*/
    align-items: flex-start;

    //  从【控件列表】拖拽字段进入时，强制宽度
    >.control-item.snail-sort-ghost {
        width: 33% !important;
    }

    >.field-item {
        cursor: move;
        user-select: none;
        border: 1px dashed transparent;

        //  鼠标移入、激活、拖拽时；特定特定边框色标记
        &:hover,
        &.actived,
        &.snail-sort-drag,
        &.snail-sort-ghost {
            border-color: #ed9239;
        }

        //  设计时模式下时，留出 copy、delete 按钮的空间
        >.field-body {
            padding-right: 40px !important;
        }

        //  设计时盖板
        >.field-cover {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            opacity: 0;
            transition: opacity ease-in-out 200ms;
            //  绝对定位，填充父元素，隐藏溢出的内容，并定位到0,0位置
            .absolute-fill-hidden();

            >.snail-icon.trash {
                margin-top: 2px;
            }
        }

        //  鼠标移入时，显示设计时盖板
        &:hover>.field-cover {
            opacity: 1;
        }
    }
}
</style>