<!-- 文本 输入框：Text、Textarea
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
 -->
<template>
    <FieldProxy class="text" :readonly="readonly" :parent-field-id="parentFieldId" :row-index="rowIndex" :field="field"
        :value="valueRef" :error="errorRef" :="proxy" @rendered="hd => { handle = hd, emits('rendered', hd) }">
        <template #="{ required, readonly, hidden }">
            <input v-if="field.type == 'Text'" type="text" :readonly="readonly" v-model="valueRef"
                :placeholder="field.placeholder" @change="onTextChange" />
            <textarea v-else-if="field.type == 'TextArea'" v-model="valueRef" :readonly="readonly"
                :placeholder="field.placeholder" @change="onTextChange" />
            <div v-else>不支持的控件：{{ field.type }}</div>
        </template>
    </FieldProxy>
</template>

<script setup lang="ts">
import { inject, onMounted, ShallowRef, shallowRef, watch, } from "vue";
import { TextControlSettings } from "../../models/control-model";
import { FieldEvents, FieldProxyRenderOptions, FieldRenderOptions, IFieldHandle, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces } from "../common/field-common";
import { getValueString, validateText } from "../../utils/field-util";
import FieldProxy from "../common/field-proxy.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldRenderOptions<TextControlSettings, string>>();
const emits = defineEmits<FieldEvents>();
const global = inject(INJECTKEY_GlobalContext);
const { field } = _;
//  2、组件交互变量、常量
/**     字段值 */
const valueRef: ShallowRef<any> = shallowRef("");
/**     字段错误信息：如字段值验证失败、、、 */
const errorRef: ShallowRef<string> = shallowRef("");
/**     旧的文本值，手工改变时，发送事件时传递旧值 */
let oldText: string;
/**     字段操作句柄：字段渲染完成后，由【field-proxy】组件的`rendered`事件传递出来 */
let handle: IFieldHandle = undefined;
/**     字段代理对象部分实现，已冻结 */
const proxy = Object.freeze<Pick<FieldProxyRenderOptions, "titleDisabled" | "emitter" | "getValue" | "setValue">>({
    titleDisabled: false,
    emitter: emits,
    getValue(validate: boolean): Promise<any> {
        const success: boolean = validate ? validateValue() : true;
        return Promise.resolve(success ? valueRef.value : undefined);
    },
    setValue(value: string): Promise<{ success: boolean, change: boolean }> {
        /** 值有变化，才操作，无变化直接成功即可 */
        value = getValueString(value);
        if (value == valueRef.value) {
            return Promise.resolve({ success: true, change: false })
        }
        //  更新字段值，并进行字段值验证
        valueRef.value = value;
        oldText = value;
        return Promise.resolve(validateValue()
            ? { success: true, change: true }
            : { success: false, change: false }
        );
    }
});

// *****************************************   👉  方法+事件    ****************************************
/**
 * 验证字段值
 * @returns true验证通过；false验证失败，error更新错误原因
 */
function validateValue(): boolean {
    /* 设计时验证字段的配置完整性；运行时验证字段的必填、文本长度、、、；其他情况不验证 */
    if (global.mode == "runtime") {
        let { success, reason } = validateText(valueRef.value, handle.getStatus().data, field.settings);
        errorRef.value = reason;
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
        const traces = newTraces(_, "value-change", "manual");
        emits("valueChange", newValue, oldValue, traces);
    }
}
//#endregion

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      运行时，初始化外部传入的字段值，强制默认值为空字符串
if (global.mode == "runtime") {
    valueRef.value = getValueString(_.value == undefined ? _.field.value : _.value);
    oldText = valueRef.value;
}
//  2、生命周期响应
// onMounted(() => { });
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-proxy.text {
    >.field-detail {
        >input {
            color: #555;
            height: 34px;
            width: 100%;
        }

        >textarea {
            color: #555;
            min-height: 50px;
            width: 100%;
        }
    }
}
</style>