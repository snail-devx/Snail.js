<!-- 表单字段集合；作为字段容器存在，负责多个字段的渲染工作
    1、支持表单设计时、运行时渲染字段，作为表单中的字段容器使用 
    2、内部不控制高度和宽度，由外部自己控制
-->
<template>
    <div class="snail-form-fields" :class="[`tc-${global.columns}`, global.mode,]">
        <!-- 设计时：增加排序组件：这个key使用字段id可能有问题，后续再考虑优化，特别是运行时的时候；设计时构建 复制、删除 按钮 -->
        <Sort v-if="global.mode == 'design'" draggable=".field-item" :changer="fields.length" :group="global.global"
            :disabled="global.readonly" @add="onDragAddField" @update="container.moveField">
            <div v-for="(field, index) in fields" :key="container.getFieldKey(field.id)"
                :class="['field-item', `fw-${getFieldWidth(field)}`]">
                <!-- <div class="field-component">{{ field.title }}</div> -->
                <!-- 字段渲染：属性直接桥接上级属性不破坏响应式，构建出  FieldRenderOptions<Settings, Value> 所需属性-->
                <Dynamic class="field-body" :key="container.getFieldKey(field.id)"
                    :="global.getControl(field.type).renderComponent" :readonly="readonly"
                    :parent-field-id="parent ? parent.id : undefined" :row-index="rowIndex" :field="field"
                    :value="values ? values[field.id] : undefined" v-bind="container.buildFieldMonitor(field)" />
                <!-- 设计时的盖板：显示复制、删除 -->
                <div class="field-cover" v-if="global.mode == 'design'"
                    :class="{ 'active': global.fieldSetting.isActiveField(field, location) }"
                    @click="onActiveField(field, index)">
                    <Icon v-if="readonly != true" type="plus" color="#aeb6c2" hover-color="#279bf1" title="复制"
                        @click="isButtonClickInCover = true, container.copyField(field, index)" />
                    <Icon v-if="readonly != true" type="trash" color="#aeb6c2" hover-color="#279bf1" title="删除"
                        @click="isButtonClickInCover = true, container.deleteField(field, index)" />
                </div>
            </div>
        </Sort>
        <!-- 运行时、预览模式：无可见字段时，给出提示 -->
        <Empty v-else-if="fields.find(field => container.isVisible(field)) == undefined" message="无可用字段" />
        <!-- 运行时、预览模式：
            1、有可见字段，直接渲染不用排序；需要计算布局，根据布局填充位置并对末尾留白补全
            2、字段渲染：属性直接桥接上级属性不破坏响应式，构建出  FieldRenderOptions<Settings, Value> 所需属性
            3、若字段为最后行的最后一个字段，则构建空白占位区域：避免行最后一个字段展示没填充满行时显示异常 -->
        <template v-else v-for="field in fields" :key="container.getFieldKey(field.id)">
            <div class="field-item" v-show="layoutMapRef.get(field.id).show"
                :class="[`fw-${layoutMapRef.get(field.id).width}`, layoutMapRef.get(field.id).isRowLast ? 'row-last' : '']">
                <Dynamic class="field-body" :key="container.getFieldKey(field.id)"
                    :="global.getControl(field.type).renderComponent" :readonly="readonly"
                    :parent-field-id="parent ? parent.id : undefined" :row-index="rowIndex" :field="field"
                    :value="values ? values[field.id] : undefined" v-bind="container.buildFieldMonitor(field)" />
            </div>
            <div class="field-item" v-if="layoutMapRef.get(field.id).blankWidthAfter > 0"
                :class="[`fw-${layoutMapRef.get(field.id).blankWidthAfter}`, 'blank-item']" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, onUnmounted, } from "vue";
import { isStringNotEmpty, } from "snail.core";
import { components, SortEvent, useReactive } from "snail.vue";
import { FieldOptions, } from "../../models/field-base";
import { FieldContainerEvents, FieldContainerLocation, FieldContainerOptions, } from "../../models/field-container";
import { FormFieldLayoutOptions } from "../../models/form-model";
import { INJECTKEY_GlobalContext, useFieldContainer } from "./field-common";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldContainerOptions & { rowIndex: number }>();
const { Sort, Icon, Dynamic, Empty } = components;
const emits = defineEmits<FieldContainerEvents>();
const { watcher } = useReactive();
/**     字段全局上下文 */
const global = inject(INJECTKEY_GlobalContext);
/**     字段位置信息：监听上级rowIndex变化，做实时更新 */
const location: FieldContainerLocation = _.parent ? { parentFieldId: _.parent.id, rowIndex: _.rowIndex || 0 } : undefined;
location && watcher(() => _.rowIndex, newIndex => Object.assign(location, { rowIndex: newIndex || 0 }));
//  2、字段容器句柄管理
/**     字段容器对象；负责接管字段容器组件部分逻辑，减少vue组件中的非渲染代码 */
const container = useFieldContainer(global, { ..._, }, location, emits);
/**     容器注册作用域 */
const scope = global.registerContainer(location, container.handle);
/**     覆盖defineProps上下文传递过来的fields属性，使用容器实例的响应式字段接管*/
const { fields } = container;
//  3、其他变量
/**     字段布局信息；key为字段id，value为布局信息，设计时无效别使用*/
const layoutMapRef = global.mode == "design" ? undefined : computed(calcFieldLayout);
/**     是否时字段Cover内的按钮点击了；实现cover内部按钮点击时，不激活字段 */
let isButtonClickInCover: boolean;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 计算字段宽度
 * @param field
 */
function getFieldWidth(field: FieldOptions<any>): number {
    const width = field.width || global.defaultSpan;
    return Math.max(1, Math.min(width, global.columns));
}
/**
 * 计算字段布局信息
 */
function calcFieldLayout(): Map<string, FormFieldLayoutOptions> {
    const layoutMap = new Map<string, FormFieldLayoutOptions>();
    /** 当前行已经占用的总宽度 */
    let totalWidthInRow = 0;
    /** 上一个布局信息；暂存用于在换行末尾行等特殊情况处理*/
    let preLayout: FormFieldLayoutOptions;
    //  遍历字段做计算，流式布局，当前行显示下，则放到下一行显示；当前行的空白列留白
    fields.forEach((field, index) => {
        const isLastField = index == fields.length - 1;
        const layout: FormFieldLayoutOptions = {
            width: getFieldWidth(field),
            show: container.isVisible(field),
            isRowLast: false,
            blankWidthAfter: 0
        };
        layoutMap.set(field.id, layout);
        //  不显示的时候，如果是最后一个字段，找上一个字段显示的字段做换行，并计算留白布局
        if (layout.show != true) {
            isLastField && asRowLastLayout(preLayout, totalWidthInRow);
            return;
        }
        /**
         * 当前字段显示时；计算当前是否能够显示下（ nowTotal = totalWidthInRow + layout.width ）
         *      1、 nowTotal == global.columns 当前行刚好显示全；作为当前行的最后一个字段，下一个字段在新行展示
         *      2、 nowTotal <  global.columns 当前行能显示下且还有剩余，直接放到当前行即可
         *      3、 nowTotal >  global.columns 当前行显示不下，放到下一行显示，上一个字段作为当前行的最后一个字段
         *  最后的处理：
         *      1、 若当前字段是最后一个字段，则强制作为当前行的最后一个字段
         *      2、 当前字段布局暂存，方便下一轮计算
         */
        const nowTotal = totalWidthInRow + layout.width;
        nowTotal == global.columns
            ? (layout.isRowLast = true, totalWidthInRow = 0)
            : nowTotal < global.columns
                ? (totalWidthInRow = nowTotal)
                : (asRowLastLayout(preLayout, totalWidthInRow), totalWidthInRow = layout.width);
        isLastField && asRowLastLayout(layout, totalWidthInRow);
        preLayout = layout;
    });
    return layoutMap;
}
/**
 * 作为行的最后一个布局
 * @param layout 布局
 * @param totalWidthInRow 当前行已经占用的总宽度
 */
function asRowLastLayout(layout: FormFieldLayoutOptions, totalWidthInRow: number) {
    if (layout != undefined && layout.isRowLast != true) {
        layout.isRowLast = true;
        layout.blankWidthAfter = global.columns - totalWidthInRow;
    }
}

//#region ----------------------------------- 设计时相关事件、方法 ----------------------------------------
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
    if (isButtonClickInCover != true) {
        global.fieldSetting.activateField(field, location)
    }
    isButtonClickInCover = false;
}
//#endregion

// *****************************************   👉  接口实现    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onUnmounted(scope.destroy);
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
        width: 50% !important;
        height: 42px;
        line-height: 42px;
        color: #63688e;
        padding-left: 10px;
        border-color: #ed9239;
        border-radius: 0 !important;
    }

    >.field-item {
        cursor: move;
        user-select: none;

        //  拖拽效果，交给 设计时盖板 呈现
        &.snail-sort-drag,
        &.snail-sort-ghost {
            border: none;
        }

        //  设计时模式下时，留出 copy、delete 按钮的空间
        >.field-body {
            padding-right: 40px !important;
        }

        //  设计时盖板
        >.field-cover {
            border: 1px dashed transparent;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            opacity: 0;
            transition: opacity ease-in-out 200ms;
            z-index: 10;
            //  绝对定位，填充父元素，隐藏溢出的内容，并定位到0,0位置
            .absolute-fill-hidden();

            >.snail-icon {
                display: none;
            }

            >.snail-icon.trash {
                margin-top: 2px;
            }
        }

        //  鼠标移入时，显示操作按钮
        &>.field-cover:hover {
            >.snail-icon {
                display: block;
            }
        }

        //  鼠标移入、激活、拖拽时；特定特定边框色标记
        &.snail-sort-drag>.field-cover,
        &.snail-sort-ghost>.field-cover,
        &>.field-cover:hover,
        &>.field-cover.active {
            opacity: 1;
            border-color: #ed9239;
        }

    }
}

//  非【设计时】的适配
.snail-form-fields:not(.design) {
    >.field-item {
        border-bottom: 1px solid #e0e1e2;
        border-right: 1px solid #e0e1e2;

        &.row-last {
            border-right: none !important;
        }

        &.blank-item {
            border-right: none !important;
        }
    }
}
</style>