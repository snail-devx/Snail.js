<!-- 时间选择组件测试 -->
<template>
    <div class="time-picker-test">
        <section class="">
            默认情况：
            <input type="text" @click="evt => onClick(evt)" />
        </section>
        <section class="">
            时分选择：
            <input type="text" @click="evt => onClick(evt, { secondDisabled: true })" />
        </section>
        <section>
            最大值 19:30:00：
            <input type="text" @click="evt => onClick(evt, { max: '19:30:00' })" />
        </section>
        <section>
            最小值 19:30:00：
            <input type="text" @click="evt => onClick(evt, { min: '19:30:00' })" />
        </section>
        <section>
            最小值 19:30:00 默认值 18:30:00：
            <input type="text" @click="evt => onClick(evt, { value: '18:30:00', min: '19:30:00' })" />
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { TimePickerOptions, usePicker } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { showTime } = usePicker();
//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************
async function onClick(evt: Event, options?: TimePickerOptions) {
    const input: HTMLInputElement = evt.target as HTMLInputElement;

    const value = await showTime(input, { ...options, value: input.value });
    value != undefined && (input.value = value);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.time-picker-test {
    >section {
        margin: 10px;
        float: left;

    }
}
</style>