<!-- 表单渲染器测试 -->
<template>
    <FormRenderer :fields="testFields" :readonly="false" :columns="4" :controls="undefined"
        @rendered="hd => handle = hd" />
    <div class="formrenderer-test-buttons">
        <button @click="getFieldValue">获取值</button>
        <button @click="setFieldValue">设置值</button>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components, FieldOptions, FieldContainerHandle, IFormDesignHandle, FormRenderHandle } from "../../libraries/snail.vue-form";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { FormRenderer } = components;
let handle: FormRenderHandle = undefined;


//  2、组件交互变量、常量
// 测试时
const testFields: FieldOptions<any>[] = [
    {
        "type": "Text",
        "id": "17700871262161",
        "title": "文本框(2)",
        "width": 3,
    },
    {
        "type": "Text",
        "id": "17700871270271",
        "title": "文本框(3)",
        "width": 2,
    },
    {
        "type": "Text",
        "id": "177008712702711",
        "title": "文本框(3)",
        "width": 2,
    },
    {
        "type": "Text",
        "id": "177008712702712",
        "title": "文本框(3)",
        "width": 2,
        hidden: true,
    },
    {
        "type": "Text",
        "id": "177008712702713",
        "title": "文本框(5)",
        "width": 3,
    }
]

// *****************************************   👉  方法+事件    ****************************************
async function getFieldValue() {
    console.log(await handle.getValue('17700871262161'))
}
function setFieldValue() {
    handle.setValue('17700871262161', new Date().getTime());
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-form-renderer {
    height: 80% !important;
    border: 1px solid #e0e1e2;
    margin-bottom: 10px;
}

.formrenderer-test-buttons {
    >button {
        margin-right: 20px;
    }
}
</style>