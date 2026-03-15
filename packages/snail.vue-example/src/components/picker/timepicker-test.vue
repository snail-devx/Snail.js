<!-- 时间选择组件测试 -->
<template>
    <article>
        <h1>默认format</h1>
        <section class="">
            默认情况
            <input type="text" @click="evt => onClick(evt)" />
        </section>
        <section class="">
            禁用工具条
            <input type="text" @click="evt => onClick(evt, { toolbarDisabled: true })" />
        </section>
        <section class="">
            禁用现在
            <input type="text" @click="evt => onClick(evt, { nowDisabled: true })" />
        </section>
        <section class="">
            禁用清空
            <input type="text" @click="evt => onClick(evt, { clearDisabled: true })" />
        </section>
        <section class="">
            禁用清空+现在
            <input type="text" @click="evt => onClick(evt, { nowDisabled: true, clearDisabled: true })" />
        </section>
        <section>
            最小值 19:30:00：
            <input type="text" @click="evt => onClick(evt, { min: '19:30:00' })" />
        </section>
        <section>
            最小值 19:30:00 默认值 18:30:00：
            <input type="text" @click="evt => onClick(evt, { value: '18:30:00', min: '19:30:00' })" />
        </section>
        <section>
            最大值 19:30:00：
            <input type="text" @click="evt => onClick(evt, { max: '19:30:00' })" />
        </section>
        <section>
            最大值 19:30:00 默认值 18:30:00：
            <input type="text" @click="evt => onClick(evt, { value: '18:30:00', max: '19:30:00' })" />
        </section>
    </article>
    <article>
        <h1>HH:mm</h1>
        <section class="">
            时分选择：
            <input type="text" @click="evt => onClick(evt, { format: 'HH:mm' })" />
        </section>
        <section class="">
            时分选择，禁用工具条
            <input type="text" @click="evt => onClick(evt, { format: 'HH:mm', toolbarDisabled: true })" />
        </section>
    </article>
    <article>
        <h1>HH:mm:ss</h1>
        <section class="">
            时分秒选择：
            <input type="text" @click="evt => onClick(evt, { format: 'HH:mm:ss' })" />
        </section>
        <section class="">
            时分秒，禁用工具条
            <input type="text" @click="evt => onClick(evt, { format: 'HH:mm:ss', toolbarDisabled: true })" />
        </section>
    </article>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { TimePickerOptions, usePicker } from "../../libraries/snail.vue";
import { IAsyncScope } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { showTime } = usePicker();
//  2、组件交互变量、常量
/** 选择器弹出组件 */
let pickerScope: IAsyncScope<string>;
let pickerTarget: HTMLInputElement;

// *****************************************   👉  方法+事件    ****************************************
async function onClick(evt: Event, options?: TimePickerOptions) {
    if (pickerScope == undefined || pickerScope.destroyed == true || pickerTarget != evt.target) {
        pickerScope && pickerScope.destroy();
        pickerTarget = evt.target as HTMLInputElement;
        pickerScope = showTime(pickerTarget, { ...options, value: pickerTarget.value });
        const value = await pickerScope;
        value != undefined && (pickerTarget.value = value);
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>