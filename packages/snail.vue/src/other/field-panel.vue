<!-- 字段区域组件
    1、作为一个表单字段的容器，实现公共字段渲染部分，字段控件交给插槽自己实现
    2、支持指定字段标题、字段是否必填、错误提示、描述信息等
    3、后期支持垂直布局，即标题和控件区域垂直排列，而不是水平排列
    4、后期支持制定尺寸模式，实现不同尺寸下的字段区域布局
  -->
<template>
    <div class="snail-field-panel" :class="mode">
        <!-- 字段头部区域：标题+必填标记：在外层包裹一下，实现多标题换行和*号跟随效果-->
        <div class="field-header">
            <div class="wrapper">
                <span class="title" v-text="title" />
                <span class="required" v-if="required" v-text="'*'" />
            </div>
        </div>
        <!-- 字段内容区域：控件、描述、错误信息 -->
        <div class="field-body">
            <!-- 字段值渲染控件，交给自定义插槽实现 -->
            <div class="control">
                <slot />
            </div>
            <!-- 描述信息和验证错误提示信息-->
            <div v-if="isStringNotEmpty(description)" class="message desc" v-text="description" />
            <div v-if="isStringNotEmpty(error)" class="message error" v-text="error" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { isStringNotEmpty } from 'snail.core';
import { usePageMode } from '../base/utils/app-util';
import { FieldPanelOptions } from './models/field-panel-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<FieldPanelOptions>();
const { mode } = usePageMode(props.mode);
//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-field-panel {
    min-height: 48px;
    position: relative;
    display: flex;
    padding: 0 14px;
    display: flex;
    align-items: stretch;
    gap: 10px;

    // 字段头部区域：14px的上下内边距，留20px的标题区域，实现48px高度下垂直居中，多行是则不垂直居中，14px的上边距为起点
    >.field-header {
        flex: none;
        padding: 14px 0;

        >div.wrapper {
            line-height: 20px;

            >span.title {
                // color: #63688E;
                color: #8A9099;
            }

            >span.required {
                color: #E64545;
                margin-left: 4px;
            }
        }
    }

    // 字段内容区域：上下间距8，采用flex布局实现垂直居中效果
    >.field-body {
        flex: 1;
        position: relative;
        padding: 8px 0;

        // 字段值渲染区域，给一些默认控件样式，确保和标题能够在同一水平线上
        >.control {
            min-height: 32px;
            display: flex;
            align-items: center;

            >input {
                flex: 1;
                height: 32px;
                line-height: 32px;
            }

            >textarea {
                flex: 1;
                line-height: 20px;
                resize: none;
                height: 100px;
            }

            //  div和span的默认样式，确保和标题在同一水平线上
            >div,
            >span {
                line-height: 20px;
            }
        }

        // 字段描述和错误提示消息区域
        >.message {
            line-height: 20px;
            font-size: 12px;
            word-break: break-all;
            overflow-wrap: break-word;

            &.desc {
                color: #A3A4A6;
            }

            &.error {
                color: #E64545;
            }
        }
    }
}

//  pc、移动端特定样式
.snail-field-panel {

    // 桌面端 特定样式
    &.desktop {
        >.field-header {
            width: 135px;
        }

        // >.field-body {
        //     >.control {

        //     }
        // }
    }

    // 移动端 特定样式，标题区域小一些，输入框取消边框和左内边距
    &.mobile {
        background: white;

        >.field-header {
            width: 100px;
        }

        >.field-body {
            >.control {

                >input,
                >textarea {
                    padding-left: 0;
                    border: none !important;
                    background: transparent !important;
                }
            }
        }
    }
}
</style>