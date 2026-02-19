<!-- 数值控件
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :type="field.type" :title="field.title" :description="field.description"
        :="{ manager: manager, error: errorRef }">
        <Number :readonly="readonly" :placeholder="field.placeholder" :="field.settings" v-model="valueRef"
            @error="error => errorRef = error" @change="onNumberChange" />
    </FieldProxy>
</template>

<script setup lang="ts">
import { isNumberNotNaN, RunResult, } from "snail.core";
import { inject, nextTick, onMounted, ShallowRef, shallowRef, } from "vue";
import { components, useReactive } from "snail.vue";
import { NumberControlSettings } from "../../models/control-model";
import { FieldEvents, FieldRenderOptions, IFieldHandle, IFieldManager, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces, useField } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<FieldRenderOptions<NumberControlSettings, number>>();
const emits = defineEmits<FieldEvents>();
const { Number } = components;
const { watcher } = useReactive();
const global = inject(INJECTKEY_GlobalContext);
const manager: IFieldManager = useField(global, props, {
    emitter: emits,
    getValue: async (validate: boolean): Promise<RunResult<any>> => {
        /** 这里有点问题，需要强制先让input失去焦点，完成自身逻辑处理，然后再得到值，一般来说事件触发的获取值，都会自动失去焦点，问题不大 */
        await nextTick();
        const success: boolean = validate ? doValidate(valueRef.value) : true;
        return success
            ? { success: true, data: valueRef.value }
            : { success: false, reason: errorRef.value };
    },
    async setValue(value: number): Promise<{ success: boolean, change: boolean }> {
        const oldNumber = valueRef.value;
        valueRef.value = value;
        await nextTick();
        return doValidate(valueRef.value)
            ? { success: true, change: oldNumber != valueRef.value }
            : { success: false, change: false };
    },
});
//  2、组件交互变量、常量
/**     已选选择项：field-proxy需要 */
const valueRef = shallowRef<number>(isNumberNotNaN(props.value) ? props.value : props.field.value);
/**     字段错误信息：如字段值验证失败、、、 */
const errorRef: ShallowRef<string> = shallowRef("");
//  3、选项相关

// *****************************************   👉  方法+事件    ****************************************
/**
 * 验证指定数值
 * @param number 
 * @returns 验证通过返回true，否则false
 */
function doValidate(number: number): boolean {
    errorRef.value = "";
    if (manager.handle.getStatus().data.required == true) {
        if (number == undefined) {
            errorRef.value = "不可为空";
            return false;
        }
    }
    if (isNumberNotNaN(props.field.settings.minValue) && props.field.settings.minValue > number) {
        errorRef.value = `不能小于最小值(${props.field.settings.minValue})`;
        return false;
    }
    if (isNumberNotNaN(props.field.settings.maxValue) && props.field.settings.maxValue < number) {
        errorRef.value = `不能大于最大值(${props.field.settings.maxValue})`;
        return false;
    }
    if (9007199254740991 < number || number < -9007199254740991) {
        errorRef.value = "超过Number的最大精度范围";
        return false;
    }

    return true;
}

/**
 * 数值改变时
 * @param newValue 
 */
function onNumberChange(newValue: number, oldValue: number) {
    if (doValidate(newValue) == true) {
        const traces = newTraces(props, "value-change", "manual");
        emits("valueChange", newValue, oldValue, traces);
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
watcher(valueRef, (newValue, oldValue) => {
    newValue != oldValue && setTimeout(doValidate, 0, newValue);
});
//  2、生命周期响应
onMounted(() => emits("rendered", manager.handle));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-item.number>.field-detail {}
</style>