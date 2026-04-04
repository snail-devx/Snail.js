<!-- 字段代理组件：代理字段的渲染逻辑
    1、多根节点组件，仅配合 form-fields 组件配合使用，由 form-fields 组件框定最外层容器
        1、字段标题、必填状态、显隐状态
        2、代理字段描述信息、字段错误信息
        3、字段的控件渲染，使用插槽进行具体渲染
        4、代理字段设计时的操作句柄和复制、删除字段操作
    2、代理字段，会自动带上类样式 field-item 这里就不用再单独样式了
-->
<template>
    <div class="field-title" v-if="isStringNotEmpty(title)">
        {{ title }}
        <span v-if="isReqired()">*</span>
    </div>
    <div class="field-detail">
        <slot />
        <div class="field-desc ellipsis" v-if="isStringNotEmpty(description)" v-text="description" />
        <div class="field-error ellipsis" v-if="isStringNotEmpty(error)" v-text="error" />
    </div>
    <!-- 字段工具栏：拖拽、复制、删除 -->
    <div class="field-toolbar" v-if="global.mode == 'design'"
        @click="isButtonClickInCover ? (isButtonClickInCover = false) : emitter('activateField')">
        <Icon v-if="isReadonly() != true" type="plus" button color="#aeb6c2" hover-color="#279bf1" title="复制"
            @click="isButtonClickInCover = true, emitter('copyField')" />
        <Icon v-if="isReadonly() != true" type="trash" button color="#aeb6c2" hover-color="#279bf1" title="删除"
            @click="isButtonClickInCover = true, emitter('deleteField')" />
    </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { components } from "snail.vue";
import { isStringNotEmpty } from "snail.core";
import { FieldRenderProxyOptions } from "../../models/field-base";
import { INJECTKEY_GlobalContext } from "./field-common";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ inheritAttrs: false })
const _ = defineProps<FieldRenderProxyOptions>();
const global = inject(INJECTKEY_GlobalContext);
const { Icon } = components;
const { isReqired, isReadonly, emitter } = _.manager;
//  2、组件交互相关变量
/**     是否时字段Cover内的按钮点击了；实现cover内部按钮点击时，不激活字段 */
let isButtonClickInCover: boolean;

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应：组件挂载后，触发【rendered】事件，通知外部做挂接
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

//  字段标题、详情基础样式：字段详情，给点最小宽度，避免撑不开宽度
.field-item {
    >.field-title {
        width: 120px;
        flex-shrink: 0;
        padding: 12px 0 10px 10px;
        color: #63688e;

        >span {
            color: #f74b4b;
        }
    }

    //  字段详情：控件展示区域，字段描述、字段错误信息展示区域
    >.field-detail {
        flex: 1;
        position: relative;
        min-width: 10px;
        overflow-x: hidden;
        padding: 4px 10px;
        //  字段详情默认颜色
        color: #2E3033;

        >.field-desc,
        >.field-error {
            width: 100%;
            font-size: 12px;
            height: 20px;
            line-height: 20px;
        }

        >.field-desc {
            color: #aaa;
        }

        >.field-error {
            color: #f74b4b;
        }
    }

    //  字段详情中特定控件的强制样式
    >.field-detail {
        input {
            height: 32px;
            width: 100%;
        }

        textarea {
            min-height: 50px;
            width: 100%;
        }
    }
}

//  字段工具栏；配合 form-fields 组件完成
.field-item.design {
    //  设计时模式下时，留出 copy、delete 按钮的空间
    padding-right: 40px !important;

    >.field-toolbar {
        cursor: move;
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

        //  鼠标移入时，显示操作按钮
        &:hover {
            >.snail-icon {
                display: block;
            }
        }
    }


    //  拖拽效果，交给 设计时盖板 呈现
    &.snail-sort-drag,
    &.snail-sort-ghost {
        border: none;
    }

    //  鼠标移入、激活、拖拽时；特定特定边框色标记
    &.snail-sort-drag>.field-toolbar,
    &.snail-sort-ghost>.field-toolbar,
    &.active>.field-toolbar,
    &>.field-toolbar:hover,
    &>.field-toolbar.active {
        opacity: 1;
        border-color: #ed9239;
    }
}
</style>