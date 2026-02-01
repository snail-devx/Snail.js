<!-- 文本 输入框，单行输入-->
<template>
    <FieldWrapper class="text" :title="field.title" :description="field.description" :required="status.required"
        :error="errorRef">
        <input type="text" :value="value" :placeholder="field.placeholder" :readonly="status.readonly"
            @change="onTextChange" />
    </FieldWrapper>
</template>

<script setup lang="ts">
import { nextTick, onMounted, Ref, ref, ShallowRef, shallowRef, toRaw, } from "vue";
import { FieldActionOptions, FieldEvents, FieldRenderOptions, FieldStatusOptions, IFieldHandle } from "../../models/field-model";
import FieldWrapper from "../common/field-wrapper.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { value, status, field } = defineProps<FieldRenderOptions<any, string>>();
const emits = defineEmits<FieldEvents>();
//  2、组件交互变量、常量
// const { valueRef, statusRef } = context.analysisField<any, string>(field.id);
const oldText: string = toRaw(value);
/**     需要展示的错误信息：如验证失败信息 */
const errorRef = shallowRef<string>();

// *****************************************   👉  方法+事件    ****************************************
/**
 * 执行text验证
 * @param text 文本值
 * @returns 验证成功返回true，否则false
 */
function doValidate(text: string): boolean {
    //  若验证失败，给出理由，并更新到 errorRef 中
    return true;
}

/**
 * 值改变事件，验证完成后触发值改变事件
 */
function onTextChange() {
    //  需要注意一下，判断是否时手动输入改变的，且还要考虑初始化时的改变、、、，也做一下延迟，避免频繁改变
    // oldText
}


//#region ----- IFieldHandle 句柄相关方法
/**
 * 验证字段
 * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
 * @returns true 验证成功，否则报错失败原因
 */
function validate(traces: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
    console.warn("text:还没进行验证操作、、、、");
    return Promise.resolve(true);
}
/**
 * 获取字段值
 * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
 * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
 * @returns 当前字段值
 */
function getValue(traces?: ReadonlyArray<FieldActionOptions>): Promise<string> {
    //  验证一下，验证成功再返回
    return Promise.resolve(value);
}
/**
 * 设置指定字段值
 * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
 * @param value 新的字段值
 * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
 * @returns true 设置成功，否则报错失败原因
 */
function setValue(value: string, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
    //  设置字段值后，判断是否验证成功，判断是否变化，发送对应事件处理
    return Promise.resolve(true);
}
/**
 * 获取字段状态
 * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
 * @returns 字段状态
 */
function getStatus(traces?: ReadonlyArray<FieldActionOptions>): FieldStatusOptions {
    return { ...status, };
}
/**
 * 设置字段状态
 * @param status 新的状态字段
 * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
 * @returns true 设置成功，否则报错失败原因
 */
function setStatus(status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
    // 还没实现
    return Promise.resolve(true);
}
//#endregion

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    const handle = Object.freeze<IFieldHandle>({
        validate,
        getValue: getValue as any,
        setValue: setValue as any,
        getStatus,
        setStatus
    });
    nextTick(() => emits("rendered", handle));
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-field-wrapper.text {
    overflow-y: visible;

    >.field-detail {
        >input {
            height: 34px;
            width: 100%;
        }
    }
}
</style>