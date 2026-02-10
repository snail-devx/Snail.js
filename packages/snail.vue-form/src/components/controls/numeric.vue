<!-- 数字类控件：金额-Money，百分比-Percent，数值-Number
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy class="numeric" :readonly="readonly" :parent-field-id="parentFieldId" :row-index="rowIndex"
        :field="field" :value="valueRef" :error="errorRef" :="proxy" @rendered="hd => emits('rendered', handle = hd)">
    </FieldProxy>
</template>

<script setup lang="ts">
import { inject, onMounted, ShallowRef, shallowRef, watch, } from "vue";
import { ChooseItem, components, SelectItem, SelectOptions } from "snail.vue";
import { OptionControlSettings, OptionControlValueItem } from "../../models/control-model";
import { FieldEvents, FieldProxyRenderOptions, FieldRenderOptions, IFieldHandle, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";
import { isArrayNotEmpty, isStringNotEmpty, newId } from "snail.core";
// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldRenderOptions<OptionControlSettings, OptionControlValueItem[]>>();
const emits = defineEmits<FieldEvents>();
const { Choose, Select } = components;
const global = inject(INJECTKEY_GlobalContext);
const { field } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     已选选择项：field-proxy需要 */
const valueRef = shallowRef<OptionControlValueItem[]>();
/**     字段错误信息：如字段值验证失败、、、 */
const errorRef: ShallowRef<string> = shallowRef("");
/**     是否是多选 */
const isMultiple: boolean = field.type == "Checkbox";
/**     字段操作句柄：字段渲染完成后，由【field-proxy】组件的`rendered`事件传递出来 */
let handle: IFieldHandle = undefined;
//  3、选项相关
/**     选择项目字典，key为选项id，value为选项对象 */
const optionMap: Map<string, OptionControlValueItem> = new Map();
/**     已选选项的id值集合*/
const valueIdsRef: ShallowRef<string[]> = shallowRef<string[]>();
//  4、其他变量、常量
/**     全局唯一Key，用于在setValue时，重新渲染对应组件的选项和已选项 */
const keyRef: ShallowRef<string> = shallowRef(newId());
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

.field-proxy.optio.combobox {}
</style>