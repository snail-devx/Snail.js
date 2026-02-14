<!-- 数值控件
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :readonly="readonly" :parent-field-id="parentFieldId" :row-index="rowIndex" :field="field"
        :value="valueRef" :error="errorRef" :="proxy" @rendered="hd => emits('rendered', handle = hd)">
        <Number #="{ required, readonly, hidden }" :readonly="readonly" :placeholder="field.placeholder"
            :="field.settings" v-model="valueRef" @error="error => errorRef = error" @change="onNumberChange" />
    </FieldProxy>
</template>

<script setup lang="ts">
import { isNumberNotNaN, } from "snail.core";
import { inject, ShallowRef, shallowRef, } from "vue";
import { components, useReactive } from "snail.vue";
import { NumberControlSettings } from "../../models/control-model";
import { FieldEvents, FieldProxyRenderOptions, FieldRenderOptions, IFieldHandle, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";
// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldRenderOptions<NumberControlSettings, number>>();
const emits = defineEmits<FieldEvents>();
const { watcher } = useReactive();
const { Number } = components;
const global = inject(INJECTKEY_GlobalContext);
const { field } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     已选选择项：field-proxy需要 */
const valueRef = shallowRef<number>(isNumberNotNaN(_.value) ? _.value : field.value);
/**     字段错误信息：如字段值验证失败、、、 */
const errorRef: ShallowRef<string> = shallowRef("");
/**     字段操作句柄：字段渲染完成后，由【field-proxy】组件的`rendered`事件传递出来 */
let handle: IFieldHandle = undefined;
//  3、选项相关
/**     字段代理对象部分实现，已冻结 */
const proxy = Object.freeze<Pick<FieldProxyRenderOptions, "titleDisabled" | "emitter" | "getValue" | "setValue">>({
    titleDisabled: false,
    emitter: emits,
    getValue(validate: boolean): Promise<any> {
        throw new Error("");
    },
    setValue(values: number): Promise<{ success: boolean, change: boolean }> {
        throw new Error("");
    },
});
// *****************************************   👉  方法+事件    ****************************************
/**
 * 验证指定数值
 * @param number 
 */
function doValidate(number: number) {
    errorRef.value = "";
    if (handle.getStatus().data.required == true) {
        if (number == undefined) {
            errorRef.value = "不可为空";
            return;
        }
    }
    if (isNumberNotNaN(field.settings.minValue) && field.settings.minValue > number) {
        errorRef.value = `不能小于最小值(${field.settings.minValue})`;
        return;
    }
    if (isNumberNotNaN(field.settings.maxValue) && field.settings.maxValue < number) {
        errorRef.value = `不能大于最大值(${field.settings.maxValue})`;
        return;
    }
}

/**
 * 数值改变时
 * @param newValue 
 */
function onNumberChange(newValue: number, oldValue: number) {
    console.log("数值改变了---", newValue, oldValue)
}


// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
watcher(valueRef, (newValue, oldValue) => {
    newValue != oldValue && setTimeout(doValidate, 0, newValue);
});
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-proxy.number>.field-detail {}
</style>