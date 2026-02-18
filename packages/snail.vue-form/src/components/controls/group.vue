<!-- 分组组件：作为控件容器，支持添加子控件进来 
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :readonly="readonly" :parent-field-id="parentFieldId" :row-index="rowIndex" :field="field"
        :value="valueRef" :error="errorRef" :="proxy" @rendered="hd => emits('rendered', handle = hd)">
    </FieldProxy>
</template>

<script setup lang="ts">
import { RunResult } from "snail.core";
import { inject, ref, ShallowRef, shallowRef, } from "vue";
import { FieldEvents, FieldProxyRenderOptions, FieldRenderOptions, IFieldHandle } from "../../models/field-base";
import { GroupControlSettings, GroupControlValue } from "../../models/control-model";
import { INJECTKEY_GlobalContext } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldRenderOptions<GroupControlSettings, GroupControlValue>>();
const emits = defineEmits<FieldEvents>();
const global = inject(INJECTKEY_GlobalContext);
const { field } = _;
//  2、组件交互变量、常量
/**     字段值 */
const valueRef: ShallowRef<any> = shallowRef("");
/**     字段错误信息：如字段值验证失败、、、 */
const errorRef: ShallowRef<string> = shallowRef("");
/**     字段操作句柄：字段渲染完成后，由【field-proxy】组件的`rendered`事件传递出来 */
let handle: IFieldHandle = undefined;
/**     字段代理对象部分实现，已冻结 */
const proxy = Object.freeze<Pick<FieldProxyRenderOptions, "titleDisabled" | "emitter" | "getValue" | "setValue">>({
    titleDisabled: true,
    emitter: emits,
    getValue(validate: boolean): Promise<RunResult<any>> {
        // const success: boolean = validate ? validateValue() : true;
        // const rt: RunResult<any> = success
        //     ? { success: true, data: valueRef.value }
        //     : { success: false, reason: errorRef.value };
        // return Promise.resolve(rt);
        throw new Error("group control does not support getValue");
    },
    setValue(value: string): Promise<{ success: boolean, change: boolean }> {
        /** 值有变化，才操作，无变化直接成功即可 */
        // value = getValueString(value);
        // if (value == valueRef.value) {
        //     return Promise.resolve({ success: true, change: false })
        // }
        // //  更新字段值，并进行字段值验证
        // valueRef.value = value;
        // oldText = value;
        // return Promise.resolve(validateValue()
        //     ? { success: true, change: true }
        //     : { success: false, change: false }
        // );
        throw new Error("group control does not support setValue");
    }
});

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>