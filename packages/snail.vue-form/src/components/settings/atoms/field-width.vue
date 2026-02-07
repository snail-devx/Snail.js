<!-- 字段宽度配置
    1、负责根据全局配置列，进行当前字段宽度配置
    2、结合【../../common/field-setting-proxy.vue】组件使用，公共样式在此组件中定义 
-->
<template>
    <div class="setting-item field-width">
        <div class="item-title" v-text="'宽度'" />
        <Select class="item-detail" :readonly="readonly" :multiple="false" :items="widthSelectItems" :value="[valueRef]"
            @change="onWidthSelectChange" />
    </div>
</template>

<script setup lang="ts">
import { inject, ref, ShallowRef, shallowRef, } from "vue";
import { FieldSettingOptions } from "../../../models/field-setting";
import { INJECTKEY_GlobalContext } from "../../common/field-common";
import { components, SelectItem } from "snail.vue";
import { isArrayNotEmpty } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { field, container, readonly } = defineProps<FieldSettingOptions<any>>();
const global = inject(INJECTKEY_GlobalContext);
const { Select } = components;
//  2、组件交互变量、常量
const widthSelectItems: SelectItem<number>[] = [];
const valueRef: ShallowRef<SelectItem<number>> = shallowRef();

// *****************************************   👉  方法+事件    ****************************************
/**
 * 字段宽度选择改变时
 * @param value 
 */
function onWidthSelectChange(values: SelectItem<number>[]) {
    if (isArrayNotEmpty(values) == true) {
        field.width = values[0].data;
        container.refresh(field.id, field);
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
{
    for (var index = 1; index <= global.columns; index++) {
        let text = index == global.columns ? "一整行" : `${index}/${global.columns}列`;
        widthSelectItems.push({ id: index.toString(), text: text, clickable: true, data: index })
    }
    const tmpWidth = field.width || global.defaultSpan;
    valueRef.value = widthSelectItems.find(item => item.data == tmpWidth) || widthSelectItems[0];
}
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-setting-proxy>.setting-item.field-width>.item-detail {}
</style>