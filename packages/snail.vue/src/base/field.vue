<!-- 字段容器组件： 
    1、渲染标题、描述、错误信息；具体字段控件由插槽自己实现
    2、提供两个插槽：default、header
    3、支持水平、垂直两种方式渲染
 -->
<template>
    <div class="snail-field" :class="[mode, direction == 'vertical' ? 'vertical' : 'horizontal']">
        <!-- 字段头部：渲染标题，可插槽重写 -->
        <div class="field-header">
            <slot name="header" :="{ mode }">
                <span class="title" v-text="title" />
                <span class="required" v-if="required" v-text="'*'" />
            </slot>
        </div>
        <!-- 字段主内容区：插槽渲染具体控件 -->
        <div class="field-body">
            <slot name="default" :="{ mode }">无default插槽渲染实际控件</slot>
        </div>
        <!-- 字段底部区域：描述信息和错误信息 -->
        <div class="field-desc" v-if="isStringNotEmpty(error)" v-text="description" />
        <div class="field-error" v-if="isStringNotEmpty(error)" v-text="error" />
    </div>
</template>

<script setup lang="ts">
import { isStringNotEmpty } from 'snail.core';
import { useApp } from '../base/utils/app-util';
import { FieldOptions } from './models/field-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<FieldOptions>();
const { mode } = useApp();
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 公共样式
.snail-field {
    // min-height: 48px;
    // padding: 8px 0;
    display: grid;
    grid-auto-rows: 0px;
    //  水平方向填充满容器，默认值即是 stretch
    // justify-content: stretch; 
    // 避免垂直方向拉伸：但后面行高最后一行使用了1fr，这里不用担拉伸问题
    // align-content: flex-start;

    &,
    >div {
        position: relative;
        word-break: break-all;
        white-space: wrap;
        overflow-x: hidden;
    }

    >.field-header {
        >span {
            line-height: 20px;

            &.title {
                // color: #63688e;
                color: #8a9099;
            }

            &.required {
                color: #e64545;
                padding-left: 4px;
            }
        }
    }

    >.field-body {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        align-content: start;

        >input {
            width: 100%;
            height: 32px;
            line-height: 32px;
        }

        >textarea {
            width: 100%;
            padding-top: 5px;
            line-height: 20px;
            resize: none;
            height: 100px;
        }

        //  div和span的默认样式，确保和标题在同一水平线上
        >div,
        >span {
            color: #2e3033;
            width: 100%;
            line-height: 20px;
        }

        //通用样式：整个一行项，填充满，居中对齐
        >.row-item {
            height: 32px;
            line-height: 32px;
        }
    }

    >.field-desc {
        line-height: 18px;
        font-size: 12px;
        color: #A3A4A6;
    }

    >.field-error {
        line-height: 18px;
        font-size: 12px;
        color: #e64545;
    }
}

//  桌面客户端：整体白色背景，水平、垂直布局样式不一样
.snail-field.desktop {

    // 水平布局，2列3行，最后一行1fr，这样避免行高均分拉伸问题
    &.horizontal {
        background: white;
        padding: 8px 14px;
        grid-template-columns: 145px 1fr;
        grid-template-rows: max-content max-content 1fr;

        >.field-header {
            grid-row: span 3;
            min-height: 32px;
            padding: 6px 10px 6px 8px;
        }

        >.field-body {
            min-height: 32px;
        }

        // >.field-desc,
        // >.field-error {
        // }
    }

    // 垂直布局,1列4行,最后一行1fr，这样避免行高均分拉伸问题
    &.vertical {
        background: white;
        padding: 14px;
        grid-template-columns: 1fr;
        grid-template-rows: max-content max-content max-content 1fr;

        // 头部需要和水平布局时，标题的起止线保持一直，这样一两2字段混排时，起止线才不会暖
        >.field-header {
            min-height: 32px;
            padding-bottom: 6px;
            padding-right: 10px;
        }

        // >.field-body{
        // }

        // >.field-desc,
        // >.field-error {
        // }
    }
}

// 移动端：header和body区域白色，desc和error区域强制独占一行
.snail-field.mobile {

    // body 内的输入框：去掉边框，后期看情况是否保留边框
    >.field-body {

        >input,
        >textarea {
            padding-left: 0;
            padding-right: 0;
            border-radius: 0;
            border: none !important;
            background: transparent !important;

            &::-webkit-scrollbar {
                width: 4px;
                height: 4px;
                background: transparent;
            }
        }
    }

    // 水平布局：2列，3行，最后一行1fr，这样避免行高均分拉伸问题
    &.horizontal {
        padding-bottom: 6px;
        grid-template-columns: 110px 1fr;
        grid-template-rows: max-content max-content 1fr;

        >.field-header {
            background: white;
            min-height: 44px;
            padding: 12px 10px 12px 14px;
        }

        >.field-body {
            background: white;
            min-height: 44px;
            padding: 6px 14px 6px 0;
        }

        >.field-desc,
        >.field-error {
            grid-column: span 2;
            padding: 0 14px;
        }
    }

    // 垂直布局,1列4行,最后一行1fr，这样避免行高均分拉伸问题
    &.vertical {
        grid-template-columns: 1fr;
        grid-template-rows: max-content max-content max-content 1fr;

        >.field-header {
            background: white;
            padding: 12px 14px 6px 14px;
        }

        >.field-body {
            background: white;
            min-height: 32px;
            padding: 0 14px 6px 14px;
        }

        >.field-desc,
        >.field-error {
            padding: 0 14px;
        }
    }
}
</style>