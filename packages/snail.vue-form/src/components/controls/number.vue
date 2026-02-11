<!-- 数值控件
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :readonly="readonly" :parent-field-id="parentFieldId" :row-index="rowIndex" :field="field"
        :value="valueRef" :error="errorRef" :="proxy" @rendered="hd => emits('rendered', handle = hd)">
        <Number #="{ required, readonly, hidden }" :readonly="readonly" :placeholder="field.placeholder"
            :="field.settings" :clamp-mode="'keep'" v-model="valueRef" />
    </FieldProxy>
</template>

<script setup lang="ts">
import { isNumberNotNaN, } from "snail.core";
import { inject, onMounted, ShallowRef, shallowRef, watch, } from "vue";
import { ChooseItem, components, SelectItem, SelectOptions } from "snail.vue";
import { NumberControlSettings, OptionControlSettings, OptionControlValueItem } from "../../models/control-model";
import { FieldEvents, FieldProxyRenderOptions, FieldRenderOptions, IFieldHandle, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";
// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldRenderOptions<NumberControlSettings, number>>();
const emits = defineEmits<FieldEvents>();
const { Icon, Number } = components;
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
    setValue(values: OptionControlValueItem[]): Promise<{ success: boolean, change: boolean }> {
        throw new Error("");
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

.field-proxy.number>.field-detail {}
</style>