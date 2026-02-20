<!-- 文本 输入框：Text、Textarea
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
 -->
<template>
    <FieldProxy :type="field.type" :title="field.title" :description="field.description"
        :="{ manager: manager, error: getError() }">
        <input v-if="field.type == 'Text'" type="text" :readonly="readonly" v-model="valueRef"
            :placeholder="field.placeholder" @change="onTextChange" />
        <textarea v-else-if="field.type == 'TextArea'" v-model="valueRef" :readonly="readonly"
            :placeholder="field.placeholder" @change="onTextChange" />
        <div v-else>不支持的控件：{{ field.type }}</div>
    </FieldProxy>
</template>

<script setup lang="ts">
import { RunResult } from "snail.core";
import { inject, nextTick, onMounted, ShallowRef, shallowRef, watch, } from "vue";
import { TextControlSettings } from "../../models/control-model";
import { FieldEvents, FieldRenderOptions, FieldValueSetResult, IFieldHandle, IFieldManager, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces, useField } from "../common/field-common";
import { getValueString, validateText } from "../../utils/field-util";
import FieldProxy from "../common/field-proxy.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<FieldRenderOptions<TextControlSettings, string>>();
const emits = defineEmits<FieldEvents>();
const global = inject(INJECTKEY_GlobalContext);
const manager: IFieldManager = useField(global, props, {
    emitter: emits,
    getValue(validate: boolean): Promise<RunResult<any>> {
        const success: boolean = validate ? validateValue() : true;
        const rt: RunResult<any> = success
            ? { success: true, data: valueRef.value }
            : { success: false, reason: getError() };
        return Promise.resolve(rt);
    },
    setValue(value: string): Promise<FieldValueSetResult> {
        /** 值有变化，才操作，无变化直接成功即可；有变化时更新字段值，并进行字段值验证 */
        value = getValueString(value);
        let result: FieldValueSetResult;
        if (value != valueRef.value) {
            const oldValue = oldText;
            valueRef.value = value;
            oldText = oldValue;
            result = validateValue()
                ? { success: true, change: true, newValue: valueRef.value, oldValue: oldValue }
                : { success: false, change: false };
        }
        return Promise.resolve(result || { success: true, change: false });
    }
});
const { handle, getError, updateError } = manager;
//  2、组件交互变量、常量
/**     字段值 */
const valueRef: ShallowRef<any> = shallowRef("");
/**     旧的文本值，手工改变时，发送事件时传递旧值 */
let oldText: string;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 验证字段值
 * @returns true验证通过；false验证失败，error更新错误原因
 */
function validateValue(): boolean {
    /* 设计时验证字段的配置完整性；运行时验证字段的必填、文本长度、、、；其他情况不验证 */
    if (global.mode == "runtime") {
        let { success, reason } = validateText(valueRef.value, handle.getStatus().data, props.field.settings);
        updateError(reason);
        return success;
    }
    return true;
}

/**
 * 文本改变时
 */
function onTextChange() {
    if (oldText == valueRef.value) {
        return;
    }
    //  暂存值，进行验证，验证通过后发送【valueChange】事件
    let oldValue = oldText, newValue = valueRef.value;
    oldText = newValue;
    if (validateValue() == true) {
        const traces = newTraces(props, "value-change", "manual");
        emits("valueChange", newValue, oldValue, traces);
    }
}
//#endregion

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      运行时，初始化外部传入的字段值，强制默认值为空字符串
if (global.mode == "runtime") {
    valueRef.value = getValueString(props.value == undefined ? props.field.value : props.value);
    oldText = valueRef.value;
}
//  2、生命周期响应
onMounted(() => emits("rendered", handle));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>