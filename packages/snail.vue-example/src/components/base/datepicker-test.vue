<!-- 组件介绍写到这里 -->
<template>
    <div class="wh-fill">
        <div style="width:100%;height:20px;color: red;" v-text="dateTextRef" />
        <hr />
        <div style="height: 60px;">
            <span>yyyy年MM月dd日</span>
            <div style="position: relative; width: 200px;display: inline-block;">
                <DatePicker style="height: 30px;border: 1px solid red;margin-bottom: 10px;opacity: 1;"
                    format="yyyy年MM月dd日" :time-disabled="true" @change="value => (dateTextRef = value)" />
            </div>
            <span>yyyy-MM-dd</span>
            <div style="position: relative; width: 200px;display: inline-block;">
                <DatePicker style="height: 30px;border: 1px solid red;margin-bottom: 10px;opacity: 1;"
                    format="yyyy-MM-dd" :time-disabled="true" @change="value => (dateTextRef = value)" />
            </div>
        </div>
        <div style="height: 60px;">
            <span>yyyy年MM月dd日 HH时mm分ss秒</span>
            <div style="position: relative; width: 220px;display: inline-block;">
                <DatePicker style="height: 30px;border: 1px solid red;margin-bottom: 10px;opacity: 1;"
                    format="yyyy年MM月dd日 HH时mm分ss秒" @change="value => (dateTextRef = value)" />
            </div>
            <span>yyyy-MM-dd HH:mm:ss</span>
            <div style="position: relative; width: 200px;display: inline-block;">
                <DatePicker style="height: 30px;border: 1px solid red;margin-bottom: 10px;opacity: 1;"
                    format="yyyy-MM-dd HH:mm:ss" @change="value => (dateTextRef = value)" min="2026-03-08 12:00:00" />
            </div>
            <span>yyyy</span>
            <div style="position: relative; width: 200px;display: inline-block;">
                <DatePicker style="height: 30px;border: 1px solid red;margin-bottom: 10px;opacity: 1;"
                    :secondDisabled="true" @change="value => (dateTextRef = value)" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated, ShallowRef, toValue } from "vue";
import { components } from "snail.vue"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { DatePicker } = components;
const dateTextRef: ShallowRef<string> = shallowRef<string>("");
//  2、可选配置选项

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>