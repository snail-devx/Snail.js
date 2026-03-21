<!-- 日期时间 控件
    1、支持 年月日  年月  年；年月日时分秒    年月日时分    年月日时
    2、支持单独时间
-->
<template>
    <FieldProxy :type="field.type" :title="field.title" :description="field.description"
        :="{ manager: manager, error: getError() }">
        <div class="date-select">
            <DatePicker :="field.settings" />
        </div>
    </FieldProxy>
</template>

<script setup lang="ts">
import { isNumberNotNaN, RunResult, } from "snail.core";
import { inject, nextTick, onMounted, ShallowRef, shallowRef, useTemplateRef, } from "vue";
import { components, useReactive } from "snail.vue";
import { DatetimeControlSettings, NumberControlSettings } from "../../models/control-model";
import { FieldEvents, FieldRenderOptions, FieldValueSetResult, IFieldHandle, IFieldManager, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces, useField } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<FieldRenderOptions<DatetimeControlSettings, string>>();
const emits = defineEmits<FieldEvents>();
const { DatePicker, Icon } = components;
const global = inject(INJECTKEY_GlobalContext);
const manager: IFieldManager = useField(global, props, {
    emitter: emits,
    getValue: async (validate: boolean): Promise<RunResult<any>> => {
        /** 这里有点问题，需要强制先让input失去焦点，完成自身逻辑处理，然后再得到值，一般来说事件触发的获取值，都会自动失去焦点，问题不大 */
        // await nextTick();
        // const success: boolean = validate ? doValidate(valueRef.value) : true;
        // return success
        //     ? { success: true, data: valueRef.value }
        //     : { success: false, reason: getError() };
        throw new Error("getValue method not implemented");
    },
    async setValue(value: number): Promise<FieldValueSetResult> {
        // const oldNumber = valueRef.value;
        // valueRef.value = value;
        // await nextTick();
        // return doValidate(valueRef.value)
        //     ? { success: true, change: oldNumber != valueRef.value, newValue: valueRef.value, oldValue: oldNumber }
        //     : { success: false, change: false };
        throw new Error("setValue method not implemented");
    },
});
const { handle, getError, updateError, isReadonly } = manager;
//  2、组件交互变量、常量
/**     已选选择项：field-proxy需要 */
const valueRef = shallowRef<string>();

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => emits("rendered", handle));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-item.datetime>.field-detail {}
</style>