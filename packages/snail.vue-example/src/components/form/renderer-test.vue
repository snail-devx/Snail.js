<!-- 表单渲染器测试 -->
<template>
    <FormRenderer :columns="4" :controls="undefined" :readonly="false" :fields="testFields" :values="values"
        mode="runtime" @rendered="hd => (handle = hd, console.log('rendered', hd))"
        @field-rendered="(field, evt) => console.log('field-rendered', field, evt)"
        @value-change="(field, evt) => console.log('value-change', field, evt)" @status-change="console.log" />
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
import {
    components, FieldOptions, GroupControlSettings, IFieldContainerHandle, IFormDesignerHandle, IFormRenderHandle,
    NumberControlSettings,
    OptionControlSettings, TextControlSettings
} from "../../libraries/snail.vue-form";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { FormRenderer } = components;
let handle: IFormRenderHandle = undefined;
let hidden: boolean = false;

//  2、组件交互变量、常量
// 测试时
const testFields: FieldOptions<TextControlSettings | OptionControlSettings | NumberControlSettings | GroupControlSettings>[] = [
    {
        "type": "Text",
        "id": "1770087123812",
        "title": "文本框",
        "width": 2,
        "required": true,
        "readonly": false,
        "hidden": false,
        "placeholder": "",
        "description": "ddddd顶顶顶"
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
                    "text": "dhd的皇帝皇后-1"
                },
                {
                    "id": "111-1-1",
                    "text": "dhd的皇帝皇后-1-1"
                },
                {
                    "id": "111-1-2",
                    "text": "dhd的皇帝皇后-1-2"
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
            "layout": "vertical",
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
        "width": 3,
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
            ],
            "searchEnabled": true
        },
        "required": true
    },

    {
        "type": "Number",
        "id": "1770715672053",
        "title": "数值-最大值10w clamp",
        "width": 3,
        required: true,
        "settings": {
            maxValue: 100000,
            clamp: "clamp",
            controls: "default",
            suffix: "万元",
            prefix: "￥",
            precision: 3,
            thousands: "inline",
            upper: true,
            formatMultiplier: 10000
        }
    },
    {
        "type": "Number",
        "id": "1770715672054",
        "title": "数值2-最小值10 keep",
        "width": 2,
        "settings": {
            minValue: 10,
            clamp: "keep",
            controls: "right",
            step: 100,
            suffix: "元",
            prefix: "￥",
            thousands: "below",
            upper: true,
        }
    },
    {
        "type": "Group",
        "id": "1771424613060",
        "title": "分组",
        "width": 100000000,
        required: true,
        // description: "dvdfa",
        "settings": {
            maxCount: 4,
            "fields": [
                {
                    "type": "Number",
                    "id": "1771668207004",
                    "title": "数值",
                    "width": 2,
                    "settings": {}
                }
            ],
        },
    }
];
const values = {
    "1770087123812": "单行文本框测试",
    "1770715672054": 12312312,
    "1771424613060": {
        children: [
            { "1771668207004": 1111 },
            { "1771668207004": 12.3 },
            { "1771668207004": 3445 },
        ]
    }
}

// *****************************************   👉  方法+事件    ****************************************
async function getValues() {
    console.log(await handle.getValues(true));
}
async function getFieldValue() {
    console.log(await handle.getValue('1770087123812', true))
    console.log(await handle.getValue('1770715672053', true))
    console.log(await handle.getValue('1770715672054', false))
    console.log(await handle.getValue('1770715672054', true))
}
async function setFieldValue() {
    console.log(await handle.setValue('1770087123812', new Date().getTime()));
    //  复选框 
    console.log(await handle.setValue('1770544423261', [{
        "id": "111-3",
        "text": "dhd的皇帝皇后-3"
    },
    {
        "id": "111-4",
        "text": "dhd的皇帝皇后-4"
    }]));
    //  单选框
    console.log(await handle.setValue('1770544427165', [{
        "id": "111-2",
        "text": "dhd的皇帝皇后-2"
    }]));
    //  下拉框
    console.log(await handle.setValue('1770544428598', [{
        "id": "111-4",
        "text": "dhd的皇帝皇后-2"
    }]));
    //  数值
    console.log(await handle.setValue("1770715672054", 1234));

}
function getFieldStatus() {
    console.log(handle.getStatus("1771424613060"));
}
function setFieldStatus() {
    hidden = !hidden;
    console.log(handle.setStatus("1770544423261", { hidden: hidden }));
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