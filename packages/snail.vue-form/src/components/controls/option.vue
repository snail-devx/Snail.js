<!-- 选择组件，支持表单的单选（Radio）、多选（Checkbox）、下拉组合（Combobox，C#叫法，更适合） 
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy class="text" :readonly="readonly" :parent-field-id="parentFieldId" :row-index="rowIndex" :field="field"
        :value="valueRef" :="proxy" @rendered="hd => { handle = hd, emits('rendered', hd) }">

    </FieldProxy>
</template>

<script setup lang="ts">
import { inject, onMounted, ShallowRef, shallowRef, watch, } from "vue";
import { OptionControlSettings, OptionControlValueItem } from "../../models/control-model";
import { FieldEvents, FieldProxyRenderOptions, FieldRenderOptions, IFieldHandle, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces } from "../common/field-common";
import { getValueString, validateText } from "../../utils/control-util";
import FieldProxy from "../common/field-proxy.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldRenderOptions<OptionControlSettings, string>>();
const emits = defineEmits<FieldEvents>();
const global = inject(INJECTKEY_GlobalContext);
const { field } = _;
//  2、组件交互变量、常量
/**     字段值 */
const valueRef = shallowRef<OptionControlValueItem[]>();
/**     旧的文本值，手工改变时，发送事件时传递旧值 */
let oldValue: OptionControlValueItem[] = undefined;
/**     字段操作句柄：字段渲染完成后，由【field-proxy】组件的`rendered`事件传递出来 */
let handle: IFieldHandle = undefined;
/**     字段代理对象部分实现，已冻结 */
const proxy = Object.freeze<Pick<FieldProxyRenderOptions, "titleDisabled" | "emitter" | "getValue" | "setValue">>({
    titleDisabled: false,
    emitter: emits,
    getValue(validate: boolean): Promise<any> {

    },
    setValue(value: string): Promise<{ success: boolean, change: boolean }> {

    },
});


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-proxy.text {
    >.field-detail {}
}
</style>