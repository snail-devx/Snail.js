<!-- 表单设计器测试 -->
<template>
    <FormDesigner :fields="testFields" :readonly="false" :columns="4" :controls="undefined" :default-span="2"
        @rendered="hd => (console.log(hd), handle = hd)" @change="console.log" />
    <div class="formdesigner-test-buttons">
        <button @click="async () => console.log(await handle.getFields())">获取表单配置</button>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components, FieldOptions, IFormDesignerHandle, NumberControlSettings, OptionControlSettings, TextControlSettings } from "../../libraries/snail.vue-form";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { FormDesigner } = components;
let handle: IFormDesignerHandle;

//  2、组件交互变量、常量
// 测试时
const testFields: FieldOptions<TextControlSettings | OptionControlSettings | NumberControlSettings>[] = [
    {
        "type": "Text",
        "id": "1770087123812",
        "title": "文本框",
        "width": 2,
        "required": true,
        "readonly": false,
        "hidden": false,
        "placeholder": "",
        "description": ""
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
        "width": 2,
        "settings": {}
    },
    {
        "type": "TextArea",
        "id": "1770087127027",
        "title": "文本框(3)",
        "width": 2
    },
    {
        "type": "Datetime",
        "id": "1772459703920",
        "title": "日期时间",
        "width": 2,
        "settings": {}
    },
    {
        "type": "Checkbox",
        "id": "1770544423261",
        "title": "复选框",
        "width": 2,
        "value": [
            {
                "id": "111-2",
                "text": "dhd的皇帝皇后-2dhd的皇帝皇后-2dhd的皇帝皇后-2dhd的皇帝皇后-2"
            }
        ],
        "settings": {
            "codeEnabled": true,
            "options": [
                {
                    "id": "111-1",
                    "text": "dhd的皇帝皇后-1",
                    "code": "dddddddddd"
                },
                {
                    "id": "111-2",
                    "text": "dhd的皇帝皇后-2"
                },
                {
                    "id": "111-3",
                    "text": "dhd的皇帝皇后-3"
                },
                {
                    "id": "111-4",
                    "text": "dhd的皇帝皇后-4"
                }
            ]
        }
    },
    {
        "type": "Radio",
        "id": "1770544427165",
        "title": "单选框",
        "width": 2,
        "settings": {
            "options": [
                {
                    "id": "111-1",
                    "text": "dhd的皇帝皇后-1dhd的皇帝皇后-2dhd的皇帝皇后-2"
                },
                {
                    "id": "111-2",
                    "text": "dhd的皇帝皇后-2"
                },
                {
                    "id": "111-3",
                    "text": "dhd的皇帝皇后-3"
                },
                {
                    "id": "111-4",
                    "text": "dhd的皇帝皇后-4"
                }
            ]
        }
    },
    {
        "type": "Combobox",
        "id": "1770544428598",
        "title": "下拉框",
        "width": 2,
        "settings": {
            "options": [
                {
                    "id": "111-1",
                    "text": "dhd的皇帝皇后-1"
                },
                {
                    "id": "111-2",
                    "text": "dhd的皇帝皇后-2"
                },
                {
                    "id": "111-3",
                    "text": "dhd的皇帝皇后-3"
                },
                {
                    "id": "111-4",
                    "text": "dhd的皇帝皇后-4"
                }
            ]
        }
    },
    {
        "type": "Number",
        "id": "1770715672053",
        "title": "数值",
        "width": 2,
        "settings": {
            controls: "default",
        }
    },
    {
        "type": "Number",
        "id": "1770715672054",
        "title": "数值2",
        "width": 2,
        "settings": {
            controls: "right",
        }
    },
    {
        "type": "Group",
        "id": "1771424613060",
        "title": "分组",
        "width": 100000000,
        "settings": {}
    }
];


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-form-designer {
    height: 90% !important;
    border: 1px solid #e0e1e2;
    margin-bottom: 10px;
}

.formdesigner-test-buttons {
    >button {
        margin-right: 20px;
    }
}
</style>