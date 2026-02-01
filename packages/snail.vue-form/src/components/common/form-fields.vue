<!-- 表单字段集合；作为字段容器存在，负责多个字段的渲染工作
    1、支持表单设计时、运行时渲染字段
    2、内部不控制高度和宽度，由外部自己控制
    3、仅作为表单中的字段容器使用 -->
<template>
    <div class="snail-form-fields" :class="[`tc-${global.columns}`, global.mode,]">
        <!-- 这个key使用字段id可能有问题，后续再考虑优化，特别是运行时的时候；设计时构建 复制、删除 按钮 -->
        <Sort draggable=".field-item" :changer="context.fields.length" :group="global.global"
            :disabled="global.readonly" @add="onDragAddField" @update="onUpdateSort">
            <div v-for="(field, index) in context.fields" class="field-item" :class="`fw-${getFieldWidth(field)}`"
                :key="field.id" @click="console.log('click')">
                <!-- <div class="field-component">{{ field.title }}</div> -->
                <Dynamic class="field-body" :key="field.id" :="global.getControl(field.type).component"
                    :props="buildFieldRenderOptions(field, index)" v-bind="monitorFieldEvents(field)"></Dynamic>
                <!-- 设计时的盖板：显示复制、删除 -->
                <div class="field-cover" v-if="global.mode == 'design'" @click="onActiveField(field, index)">
                    <Icon type="plus" color="#aeb6c2" hover-color="#279bf1" title="复制"
                        @click="onCopyField(field, index)" />
                    <Icon type="trash" color="#aeb6c2" hover-color="#279bf1" title="删除"
                        @click="onDeleteField(field, index)" />
                </div>
            </div>
        </Sort>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, shallowRef, } from "vue";
import { isStringNotEmpty, moveFromArray, removeFromArray } from "snail.core";
import { components, EventsType, SortEvent } from "snail.vue";
import { ControlOptions } from "../../models/control-model";
import { FieldContainerOptions, FieldEvents, FieldOptions, FieldRenderOptions, IFieldContainerContext, IFieldHandle } from "../../models/field-model";
import { FormDesignEvents, FormRenderOptions } from "../../models/form-model";
import { INJECTKEY_GlobalContext, useContainerContext } from "./field-share";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { context, } = defineProps<{ context: IFieldContainerContext }>();
const { Sort, Icon, Dynamic } = components;
/**   字段全局上下文 */
const global = inject(INJECTKEY_GlobalContext);
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 计算字段宽度
 * @param field
 */
function getFieldWidth(field: FieldOptions<any>): number {
    const width = field.width || global.defaultFieldSpan;
    return Math.max(1, Math.min(width, global.columns));
}
/**
 * 构建字段渲染配置选项
 * @param field 
 * @param index 
 */
function buildFieldRenderOptions(field: FieldOptions<any>, index: number): FieldRenderOptions<any> {
    return {
        field: field,
        context: context,
    };
}
/**
 * 监听字段事件
 * @param field 
 * @returns 返回要监听的事件对象 
 */
function monitorFieldEvents(field: FieldOptions<any>): EventsType<FieldEvents> {
    return {
        onRendered(handle: IFieldHandle) {
            debugger;
        }
    }
}

/**
 * 字段渲染完成
 * @param field 
 * @param index 
 * @param handle 
 */
function onFieldRendered(field: FieldOptions<any>, index: number, handle: IFieldHandle) {
    //  渲染完成后，触发判断，字段是否真的全渲染完了、、、、，若全部渲染玩了，则触发容器的渲染完成事件
    //  把句柄存储起来，方便后续做操作
    console.log(handle);
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
        //  是否需要添加
        //      全新添加字段：钩子函数判断是否能够添加
        if (isStringNotEmpty(type) == true) {
            field = context.buildField(type);
            global.hook.addField && (success = global.hook.addField(field, context.parent));
        }
        //      从其他字段容器移动过来的字段
        else {
            alert("移动添加还没实现呢");
        }
        //  添加字段，然后发送字段改变事件
        if (success !== false) {
            context.fields.splice(evt.newIndex, 0, field);
            //  发送字段改变事件
        }
    }
}
/**
 * 调整字段顺序
 * @param oldIndex 
 * @param newIndex 
 */
function onUpdateSort(oldIndex: number, newIndex: number) {
    moveFromArray(context.fields, oldIndex, newIndex);
    //  发送字段改变事件
}
/**
 * 复制字段
 * @param field 源字段
 * @param index 源字段索引位置
 */
function onCopyField(field: FieldOptions<any>, index: number) {
    let need = global.hook.copyField ? global.hook.copyField(field, context.parent) : undefined;
    if (need !== false) {
        field = context.buildField(field.type, field);
        context.fields.splice(index + 1, 0, field);
        //  发送字段改变事件
    }
}
/**
 * 删除字段
 * @param index 字段位置
 */
function onDeleteField(field: FieldOptions<any>, index: number) {
    let need = global.hook.removeField ? global.hook.removeField(field, context.parent) : undefined;
    if (need !== false) {
        context.fields.splice(index, 1);
        //  发送字段改变事件
    }
}
/**
 * 激活字段-进入字段设置界面
 * @param field 
 * @param index 
 */
function onActiveField(field: FieldOptions<any>, index: number) {
    //  发送字段激活事件
    alert("准备激活字段，进入字段设置");
}

//#endregion

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