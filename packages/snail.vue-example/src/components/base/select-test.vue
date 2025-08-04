<!-- 组件介绍写到这里 -->
<template>
    1111111111111111111111111111111111111111111
    <Select :items="items" :search="{ autoComplete: true }" style="width: 200px;" />
    <Select :items="items" :search="{}" :show-path="true" v-model="selectValues"
        style="width: 200px;position: absolute;right: 10px; top: 20px;" />
    <Select :items="items" :search="{}" :show-path="true" v-model="selectValues"
        style="width: 200px;position: absolute;right: 50%; top: 50%;">
        <template v-slot="{ closeFollow, stopPropagation }: SelectSlotOptions<any>">
            哈哈哈 <button @click="() => { closeFollow(); stopPropagation(500); }">哈哈得到</button>
        </template>
    </Select>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components, SelectItem, SelectSlotOptions } from "../../core";

// *****************************************   👉  组件定义    *****************************************
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
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";
</style>