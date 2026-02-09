<!-- 字段的boolean类属性配置
    1、如字段必填、只读、隐藏等属性；使用此组件进行配置，外部监听 change 事件同步属性值
    2、结合【../../common/field-setting-proxy.vue】组件使用，公共样式在此组件中定义
-->
<template>
    <div class="setting-item">
        <div class="item-title" v-text="title" />
        <div class="item-detail right">
            <Switch :readonly="readonly" v-model="valueRef" @change="value => emits('change', value)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, ShallowRef, } from "vue";
import { FieldPropertySettingOptions } from "../../../models/field-setting";
import { ChangeEvents, components } from "snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldPropertySettingOptions<boolean>>();
const emits = defineEmits<ChangeEvents<boolean>>();
const { Switch } = components;
//  2、组件交互变量、常量
const valueRef: ShallowRef<boolean> = ref(_.value);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>