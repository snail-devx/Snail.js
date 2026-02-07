<!-- 表单渲染器测试 -->
<template>
    <FormRenderer :columns="4" :controls="undefined" :readonly="false" :fields="testFields" :values="values"
        mode="runtime" @rendered="hd => (handle = hd, console.log(hd))" @field-rendered="console.log"
        @value-change="console.log" @status-change="console.log" />
    <div class="formrenderer-test-buttons">
        <button @click="getValues">获取表单值</button>
        <button @click="getFieldValue">获取字段值</button>
        <button @click="setFieldValue">设置字段值</button>
        <button @click="getFieldStatus">获取字段状态</button>
        <button @click="setFieldStatus">设置字段状态</button>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components, FieldOptions, IFieldContainerHandle, IFormDesignerHandle, IFormRenderHandle, TextControlSettings } from "../../libraries/snail.vue-form";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { FormRenderer } = components;
let handle: IFormRenderHandle = undefined;
let hidden: boolean = false;

//  2、组件交互变量、常量
// 测试时
const testFields: FieldOptions<TextControlSettings>[] = [
    {
        "type": "Text",
        "id": "17700871262161",
        "title": "文本框(2) 2~10",
        "width": 3,
        settings: {
            minLength: 2,
            maxLength: 10,
        }
    },
    {
        "type": "Text",
        "id": "17700871270271",
        "title": "文本框(3) 2~",
        "width": 2,
        settings: {
            minLength: 2,
        }
    },
    {
        "type": "Text",
        "id": "177008712702711",
        "title": "文本框(4) ~10",
        "width": 2,
        settings: {
            maxLength: 10,
        }
    },
    {
        "type": "Text",
        "id": "177008712702712",
        "title": "文本框(5) ",
        "width": 2,
        hidden: true,
    },
    {
        "type": "Text",
        "id": "177008712702713",
        "title": "文本框(6) 必填",
        "width": 3,
        required: true,
    }
]
const values = {
    "17700871262161": "单行文本框测试"
}

// *****************************************   👉  方法+事件    ****************************************
async function getValues() {
    console.log(await handle.getValues(true));
}
async function getFieldValue() {
    console.log(await handle.getValue('17700871262161', true))
}
async function setFieldValue() {
    console.log(await handle.setValue('17700871262161', new Date().getTime()));
}
function getFieldStatus() {
    console.log(handle.getStatus("17700871270271"));
}
function setFieldStatus() {
    hidden = !hidden;
    console.log(handle.setStatus("17700871270271", { hidden: hidden }));
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