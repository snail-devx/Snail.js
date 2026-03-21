<!-- 日期选择组件测试 -->
<template>
    <!-- yyyy 测试 -->
    <article>
        <h1>yyyy</h1>
        <section class="">
            默认情况
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy' })" />
        </section>
        <section class="">
            禁用操作按钮
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy', toolbarDisabled: true })" />
        </section>
        <section class="">
            最小值 2026
            <input type="text" value="2023" @click="evt => onClick(evt, { format: 'yyyy', min: '2026' })" />
        </section>
        <section class="">
            最大值 2026
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy', max: '2026' })" />
        </section>
        <section class="">
            最大值 2025
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy', max: '2025' })" />
        </section>
        <section class="">
            最小值 2026；最大值 2026
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy', min: '2026', max: '2026' })" />
        </section>
        <section class="">
            最小值 1990；最大值 2026
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy', min: '1990', max: '2026' })" />
        </section>
    </article>
    <!-- yyyy-MM 测试 -->
    <article>
        <h1>yyyy-MM</h1>
        <section class="">
            默认情况
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM' })" />
        </section>
        <section class="">
            禁用操作按钮
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', toolbarDisabled: true })" />
        </section>
        <section class="">
            最小值 2026-03
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', min: '2026-03' })" />
        </section>
        <section class="">
            最小值 2026-04
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', min: '2026-04' })" />
        </section>
        <section class="">
            最大值 2026-03
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', max: '2026-03' })" />
        </section>
        <section class="">
            最大值 2026-04
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', max: '2026-04' })" />
        </section>
        <section class="">
            最小值 2026-03；最大值 2026-03
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', min: '2026-03', max: '2026-03' })" />
        </section>
        <section class="">
            最小值 2026-03；最大值 2026-04
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', min: '2026-03', max: '2026-04' })" />
        </section>
        <section class="">
            最小值 2026-03；最大值 2026-12
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', min: '2026-03', max: '2026-12' })" />
        </section>
        <section class="">
            最小值 2025-03；最大值 2026-12
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM', min: '2025-03', max: '2026-12' })" />
        </section>
    </article>
    <!-- yyyy-MM-dd 测试 -->
    <article>
        <h1>yyyy-MM-dd</h1>
        <section class="">
            不指定格式
            <input type="text" @click="evt => onClick(evt)" />
        </section>
        <section class="">
            默认情况
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd' })" />
        </section>
        <section class="">
            禁用操作按钮
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd', toolbarDisabled: true })" />
        </section>
        <section class="">
            最小值 2026-03-25
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd', min: '2026-03-25' })" />
        </section>
        <section class="">
            最小值 2026-04-25
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd', min: '2026-04-25' })" />
        </section>
        <section class="">
            最大值 2026-03-25
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd', max: '2026-03-25' })" />
        </section>
        <section class="">
            最大值 2026-04-25
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd', max: '2026-04-25' })" />
        </section>
        <section class="">
            最小值 2026-03-25；最大值 2026-03-25
            <input type="text"
                @click="evt => onClick(evt, { format: 'yyyy-MM-dd', min: '2026-03-25', max: '2026-03-25' })" />
        </section>
        <section class="">
            最小值 2026-03-25；最大值 2026-04-25
            <input type="text"
                @click="evt => onClick(evt, { format: 'yyyy-MM-dd', min: '2026-03-25', max: '2026-04-25' })" />
        </section>
        <section class="">
            最小值 2026-03-25；最大值 2026-12-25
            <input type="text"
                @click="evt => onClick(evt, { format: 'yyyy-MM-dd', min: '2026-03-25', max: '2026-12-25' })" />
        </section>
        <section class="">
            最小值 2025-03-25；最大值 2026-12-25
            <input type="text"
                @click="evt => onClick(evt, { format: 'yyyy-MM-dd', min: '2025-03-25', max: '2026-12-25' })" />
        </section>
    </article>
    <article>
        <h1>yyyy-MM-dd HH:mm</h1>
        <section class="">
            默认情况
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd HH:mm' })" />
        </section>
        <section class="">
            最小值2026-03-15
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd HH:mm', min: '2026-03-15' })" />
        </section>
        <section class="">
            最小值2026-03-15 22:00
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd HH:mm', min: '2026-03-15 22:00' })" />
        </section>
        <section class="">
            禁用操作按钮
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd HH:mm', toolbarDisabled: true })" />
        </section>
    </article>
    <article>
        <h1>yyyy-MM-dd HH:mm:ss</h1>
        <section class="">
            默认情况
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd HH:mm:ss' })" />
        </section>
        <section class="">
            禁用操作按钮
            <input type="text" @click="evt => onClick(evt, { format: 'yyyy-MM-dd HH:mm:ss', toolbarDisabled: true })" />
        </section>
    </article>
    <article>
        <h1>DatePicker组件测试</h1>
        <section class="">
            默认情况
            <DatePicker :value="valueRef" @change="console.log" />
        </section>
        <section class="">
            禁用操作按钮 :format="'yyyy-MM-dd HH:mm'"
            <DatePicker :format="'yyyy-MM-dd HH:mm'" :value="valueRef" @change="console.log" style="width: 100px;" />
        </section>
    </article>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { usePicker, DatePickerOptions, components } from "../../libraries/snail.vue";
import { IAsyncScope } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { showDate } = usePicker();
const { DatePicker } = components;
//  2、组件交互变量、常量
/** 选择器弹出组件 */
let pickerScope: IAsyncScope<string>;
let pickerTarget: HTMLInputElement;
const valueRef = shallowRef();

// *****************************************   👉  方法+事件    ****************************************
async function onClick(evt: Event, options?: DatePickerOptions) {
    if (pickerScope == undefined || pickerScope.destroyed == true || pickerTarget != evt.target) {
        pickerScope && pickerScope.destroy();
        pickerTarget = evt.target as HTMLInputElement;
        pickerScope = showDate(pickerTarget, { ...options, value: pickerTarget.value });
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