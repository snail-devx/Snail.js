<!-- 表单设计器测试 -->
<template>
    <FormDesigner :fields="testFields" :readonly="false" :columns="4" :controls="undefined" :default-span="2" />
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components, FieldOptions } from "../../libraries/snail.vue-form";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { FormDesigner } = components;

//  2、组件交互变量、常量
// 测试时
const testFields: FieldOptions<any>[] = [
    {
        "type": "Text",
        "id": "1770087123812",
        "title": "文本框",
        "width": 2
    },
    {
        "type": "Text",
        "id": "1770087124425",
        "title": "文本框(1)",
        "width": 2
    },
    {
        "type": "Text",
        "id": "1770087126216",
        "title": "文本框(2)",
        "width": 2
    },
    {
        "type": "Text",
        "id": "1770087127027",
        "title": "文本框(3)",
        "width": 2
    }
]


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>