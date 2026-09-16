<!-- 日期时间 的滚动选择器
    1、支持选择日期时间，日期，时间 三种模式，通过 format区分
  -->
<template>
    <Flex class="snail-datetime-scroll-picker" :direction="'column'">
        <!-- 标题头部 -->
        <Flex class="picker-header" :cross="'center'">
            <span class="pick-button" v-text="'取消'" />
            <span class="pick-button" v-text="'清空'" />
            <span class="pick-title ellipsis" v-text="title" />
            <span class="pick-button" v-text="'确定'" />
        </Flex>
        <!-- 选择内容区域 年月日 时分秒 -->
        <Flex class="picker-body" :cross="'stretch'">
            <ScrollPicker :items="[{ code: '2022', name: '2022' }]" />
        </Flex>
    </Flex>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import Flex from "../../container/flex.vue";
import ScrollPicker from "../scroll-picker.vue";
import { TitleOptions } from "../../base/models/base-model.js";


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<TitleOptions>();


//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-datetime-scroll-picker {
    position: relative;
    height: 230px;
    width: 100%;
    overflow: hidden;
    user-select: none;
    border-radius: 0 !important;
    box-shadow: none !important;
    align-self: flex-end;

    // 标题头部
    >.pick-header {
        height: 36px;
        background: #f2f1f6;
        display: flex;
        align-items: center;
        padding: 0 14px;
        gap: 20px;

        >.pick-button {
            flex-shrink: 0;
            cursor: pointer;
            color: #0188FD;
            //  取消移动端点击高亮色
            -webkit-tap-highlight-color: transparent;
        }

        >.pick-title {
            flex: 1;
            color: #2e3033;
            font-size: 16px;
            text-align: center;
        }
    }
}
</style>