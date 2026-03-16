<!-- 表单字段集合；作为字段容器存在，负责多个字段的渲染工作
    1、支持表单设计时、运行时渲染字段，作为表单中的字段容器使用 
    2、内部不控制高度和宽度，由外部自己控制
-->
<template>
    <div class="snail-form-fields" :class="[`tc-${global.columns}`, global.mode]" :title="buildGlobalTitle()">
        <!-- 设计时：增加排序组件：这个key使用字段id可能有问题，后续再考虑优化，特别是运行时的时候；设计时构建 复制、删除 按钮 -->
        <Sort v-if="global.mode == 'design'" draggable=".field-item" handle=".field-toolbar" :changer="fields.length"
            :group="{ name: global.global, put: onPutItem, pull: onPullItem }" :disabled="global.readonly"
            @start="onDragStart" @add="onDragAddField" @update="moveField" @end="onDragEnd">
            <template v-for="(field, index) in fields" :key="getFieldKey(field.id)">
                <div class="field-item" :class="buildFieldClass(field)" :data-type="'field'" :data-index="index">
                    <Dynamic :="global.getControl(field.type).renderComponent" :readonly="readonly"
                        :parent-field-id="parent ? parent.id : undefined" :row-index="rowIndex" :field="field"
                        v-bind="buildFieldMonitor(field)" @copy-field=" canCopyField(field) && copyField(field, index)"
                        @delete-field=" canDeleteField(field) && deleteField(field, index)"
                        @activate-field="global.fieldSetting.activateField(field, location)" />
                </div>
            </template>
        </Sort>
        <!-- 运行时、预览模式：无可见字段时，给出提示 -->
        <Empty v-else-if="fields.find(field => isVisible(field)) == undefined" message="无可用字段" />
        <!-- 运行时、预览模式
            1、有可见字段，直接渲染不用排序；需要计算布局，根据布局填充位置并对末尾留白补全
            2、字段渲染：属性直接桥接上级属性不破坏响应式，构建出  FieldRenderOptions<Settings, Value> 所需属性
            3、若字段为最后行的最后一个字段，则构建空白占位区域：避免行最后一个字段展示没填充满行时显示异常 
        -->
        <template v-else>
            <template v-for="(field, index) in fields" :key="getFieldKey(field.id)">
                <div class="field-item" :class="buildFieldClass(field)" v-show="layoutMapRef.get(field.id).show">
                    <Dynamic :="global.getControl(field.type).renderComponent" :readonly="readonly"
                        :parent-field-id="parent ? parent.id : undefined" :row-index="rowIndex" :field="field"
                        v-bind="buildFieldMonitor(field)" :value="values ? values[field.id] : undefined" />
                </div>
                <div class="field-item" v-if="layoutMapRef.get(field.id).blankWidthAfter > 0"
                    :class="[`fw-${layoutMapRef.get(field.id).blankWidthAfter}`, 'blank-item']" />
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, onUnmounted, shallowRef, ShallowRef, } from "vue";
import { IScope, throwIfNullish, } from "snail.core";
import { components, SortEvent, useReactive } from "snail.vue";
import { FieldOptions, } from "../../models/field-base";
import { FieldContainerEvents, FieldContainerLocation, FieldContainerOptions } from "../../models/field-container";
import { INJECTKEY_GlobalContext } from "./field-common";
import { useContainer } from "./field-container";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldContainerOptions & { rowIndex: number }>();
const { Sort, Dynamic, Empty } = components;
const emits = defineEmits<FieldContainerEvents>();
const { watcher } = useReactive();
/**     字段全局上下文 */
const global = inject(INJECTKEY_GlobalContext);
//  2、字段容器句柄管理
/**     字段位置信息：监听上级rowIndex变化，做实时更新 */
const location: FieldContainerLocation = _.parent
    ? { parentFieldId: _.parent.id, rowIndex: _.rowIndex || 0 }
    : undefined;
/**     字段容器对象；负责接管字段容器组件部分逻辑，减少vue组件中的非渲染代码；覆盖defineProps上下文传递过来的fields属性，使用容器实例的响应式字段接管 */
const {
    fields, handle,
    getFieldWidth, getFieldKey, buildFieldMonitor, isVisible, calcFormLayout,
    canAddField, canCopyField, canDeleteField, addField, copyField, deleteField, moveField
} = useContainer(global, { ..._, }, location, emits);;
/**     容器注册作用域 */
const scope: IScope = global.registerContainer(location, handle);
//  3、其他变量
/**     字段布局信息；key为字段id，value为布局信息，设计时无效别使用*/
const layoutMapRef = global.mode == "design" ? undefined : computed(calcFormLayout);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建全局title提示
 * - 设计时非只读时，若无字段，则提示拖拽控件
 */
function buildGlobalTitle(): string {
    return global.readonly != true && global.mode == "design" && fields.length == 0
        ? "拖拽控件/字段到容器中，完成字段配置"
        : "";
}
/**
 * 构建字段的 class 类样式数组
 * @param field 
 */
function buildFieldClass(field: FieldOptions<any>): string[] {
    //  字段渲染宽度：非设计时，需要进行实时计算处理
    const width: number = global.mode == "design"
        ? getFieldWidth(field)
        : layoutMapRef.value.get(field.id).width;
    const classes: string[] = [
        `fw-${width}`,
        global.mode,
        global.layout,
        field.type.toLowerCase(),
    ];
    //  设计时，加上是否时激活字段标记；非设计时时，最后一行添加特定类样式
    global.mode == "design"
        ? global.fieldSetting.isActiveField(field, location) && classes.push("active")
        : layoutMapRef.value.get(field.id).isRowLast && classes.push("row-last");

    return classes;
}

// ***************************************** 设计时拖拽字段相关 ****************************************
/**
 * 解析拖拽元素信息
 * - 配合 onPutItem onPullItem 使用
 * @param item 拖拽元素dom
 * @param fromControl 从控件列表拖拽时的回调，type表示控件类型
 * @param fromField 从容器拖拽字段时的回调，field为字段配置，locaiton为字段原始容器位置信息
 */
function analysisDragItem(item: HTMLElement, fromControl: (type: string) => void, fromField: (field: FieldOptions<any>, remove: () => void) => void) {
    //  添加进来时，判断是否可添加
    switch (item.getAttribute("data-type")) {
        //  拖拽控件添加字段
        case "control": {
            const type: string = item.getAttribute("data-tag");
            fromControl && fromControl(type);
            break;
        }
        //  从其他容器拖拽字段过来，配合 onDragStart 中添加信息，分析出字段信息
        case "field": {
            const field: FieldOptions<any> = item["_FIELD"];
            const remove: () => void = item["_DELETE"];
            throwIfNullish(field, "cannot find field info from drag item by item['_FIELD']");
            fromField && fromField(field, remove);
            break;
        }
    }
}

/**
 * 开始拖拽时
 * - 分析出元素所属字段相关信息
 * @param evt 
 */
function onDragStart(evt: SortEvent) {
    const index: number = parseInt(evt.item.getAttribute("data-index"));
    const field = fields[index];
    evt.item["_LOCATION"] = location;
    evt.item["_FIELD"] = field;
    //  挂载一个移除字段的方法，将字段从当前容器拖拽到其他容器后，从当前容器移除
    evt.item["_DELETE"] = () => deleteField(field, index);
}
/**
 * 从别的容器拖拽字段/控件到此容器时
 * @param item 被拖拽的字段/控件dom
 * @param to 目标容器dom
 * @param from 原始容器dom
 * @returns 返回false，表示字段不能添加到此容器中
 */
function onPutItem(item: HTMLElement, to: HTMLElement, from: HTMLElement): boolean {
    let bValue: boolean;
    analysisDragItem(item,
        type => bValue = canAddField(type, undefined),
        field => bValue = canAddField(field.type, field)
    );
    return bValue !== false;
}
/**
 * 字段脱离此容器时
 * @param item 被拖拽的字段dom
 * @param to 目标容器dom
 * @param from 当前容器dom
 * @returns 返回false，表示字段不能从此容器中移除
 */
function onPullItem(item: HTMLElement, to: HTMLElement, from: HTMLElement): boolean {
    //  只会分析 fromField，不会由fromControl；判断在此容器中是否可移除，不可移除则返回false
    let bvalue: boolean;
    analysisDragItem(item, undefined, field => bvalue = canDeleteField(field));
    return bvalue !== false;
}
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
    evt.from !== evt.to && analysisDragItem(evt.item,
        type => addField(type, evt.newIndex, undefined),
        (field, remove) => {
            /* 从以前的容器中移除，然后在此容器中添加（将拖拽的dom节点移除，由vue重新构建字段节点） */
            remove();
            evt.item.remove();
            addField(field.type, evt.newIndex, field);
        }
    )
}
/**
 * 拖拽结束时
 * - 清理掉附加到元素上的信息
 * @param evt 
 */
function onDragEnd(evt: SortEvent) {
    delete evt.item["_LOCATION"];
    delete evt.item["_FIELD"];
    delete evt.item["_DELETE"];
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
location && watcher(() => _.rowIndex, newIndex => Object.assign(location, { rowIndex: newIndex || 0 }));
//  2、生命周期响应
onUnmounted(() => scope.destroy());
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
        min-height: 40px;
        display: flex;
        flex-wrap: nowrap;
        align-items: flex-start;
    }
}

// *****************************************   👉  特定样式适配    *****************************************
//  设计时的适配
.snail-form-fields.design {
    /* 设计时；按照字段自身高度，不撑开，避免 field-cover 高度太高影响效果*/
    align-items: flex-start;
    user-select: none;
    //  设计时，底部留白，避免想拖拽到最后一行的下面时，不好操作的问题
    padding-bottom: 20px;

    // &::before {
    //     position: absolute;
    //     color: gray;
    //     content: '拖拽字段';
    //     left: 0;
    //     width: 100%;
    //     text-align: center;
    //     top: 40px
    // }

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

//  字段宽度样式：不同总列数下，平分宽度
.snail-form-fields {

    //  总列数为1（一行一列）
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
</style>