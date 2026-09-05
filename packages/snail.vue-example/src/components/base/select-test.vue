<!-- 组件介绍写到这里 -->
<template>
    1111111111111111111111111111111111111111111
    <Select style="width: 200px;" :search="{ autoComplete: true }" :items="items" :readonly="true"
        @change="values => selectValues = values" />
    <Select style="width: 200px;position: absolute;right: 10px; top: 20px;" :search="{}" :show-path="true"
        :items="items" @change="values => selectValues = values" />
    <Select style="width: 200px;position: absolute;right: 50%; top: 50%;" :search="{}" :show-path="true" :items="items"
        @change="values => selectValues = values">
        <template v-slot="{ clear }: SelectSlotOptions">
            哈哈哈 <button @click="clear(true, true)">哈哈得到</button>
        </template>
    </Select>
    <Select style="width: 200px;position: absolute;right: 50%; top: 70%;" :search="{}" :show-path="true" :items="[]"
        @change="values => selectValues = values">
    </Select>
    <hr />
    <div>{{ selectValues }}</div>
    <hr />
    <Select style="width: 200px;position: absolute;left: 10px; bottom: 20px;" :show-path="true" :show-clear="true"
        :items="items" @change="values => selectValues = values" />
    <Select style="width: 200px;position: absolute;left: 300px; bottom: 20px;" :show-path="true" :show-clear="true"
        :multiple="true" :items="[
            // { 'text': '1', clickable: true, children: [{ text: '1-1', clickable: true }] },
            { 'text': '2', clickable: true, },
            { 'text': '3', clickable: true, },
            { 'text': '4', clickable: true, },
        ]" @change="values => selectValues = values" />
    <Select style="width: 200px;position: absolute;left: 600px; bottom: 20px;" :show-path="true" :show-clear="true"
        :multiple="false" :items="[
            // { 'text': '1', clickable: true, children: [{ text: '1-1', clickable: true }] },
            { 'text': '2', clickable: true, },
            { 'text': '3', clickable: true, },
            { 'text': '4', clickable: true, },
        ]" @change="values => selectValues = values" />
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components, SelectItem, SelectSlotOptions } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
const sleevalue: any = undefined;
//  1、props、data
const { Select } = components;
const items: SelectItem<number>[] = [
    { text: "1", type: "item", clickable: true, searchable: true },
    {
        text: "2", type: "group", children: [
            { text: "2-1", type: "group" },
            {
                text: "2-2", type: "group", children: [
                    { text: "2-2-1", type: "item", clickable: true, searchable: true },
                    { text: "2-2-2 2-2-2 2-2-2 2-2-2 2-2-2 2-2-2 2-2-2 2-2-2", type: "item", clickable: true, searchable: true }
                ]
            }
        ]
    },
    {
        text: "3", type: "group", children: [
            { text: "3-1", type: "item", clickable: true, searchable: true },
            {
                text: "3-2", type: "group", children: [
                    { text: "3-2-1", type: "item", clickable: true, searchable: true },
                    {
                        text: "3-2-2", type: "group", children: [
                            { text: "3-2-2-1", type: "item", clickable: true, searchable: true },
                            { text: "3-2-2-2", type: "item", clickable: true, searchable: true }

                        ]
                    },
                    {
                        text: "3-2-3", type: "group", children: [
                            { text: "3-2-3-1", type: "item", clickable: true, searchable: true },
                            {
                                text: "3-2-3-2", type: "group", children: [
                                    { text: "3-2-3-2-1", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-2", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-3", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-4", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-5", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-6", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-7", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-8", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-9", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-10", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-11", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-12", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-13", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-14", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-15", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-16", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-17", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-18", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-19", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-20", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-21", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-22", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-23", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-24", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-25", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-26", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-27", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-28", type: "item", clickable: true, searchable: true },
                                    { text: "3-2-3-2-29", type: "item", clickable: true, searchable: true },

                                ]
                            }
                        ]
                    },

                ]
            }
        ]
    },
    { text: "4-不可点击-item", type: "item" }
];
/** 已选节点值 */
const selectValues = shallowRef<SelectItem<number>[]>([]);
//  2、可选配置选项
defineOptions({ name: "SelectTest", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
watch(selectValues, () => {
    console.log(selectValues.value);
});
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>