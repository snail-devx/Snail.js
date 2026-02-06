<!-- 字段代理组件：代理字段的渲染逻辑
    1、将字段的通用信息和功能封装进来，复用通用代码，简化字段渲染
    2、包含字段的标题，字段详细渲染信息采用插槽方式
    3、代理字段状态相关信息，封装字段操作句柄
    4、字段值由各字段控件自己处理，涉及到默认值、验证规则等等、、、
        这里双向绑定 valueModel ，仅是为了配合实现IFieldHandle功能，不对value做任何加工处理
-->
<template>
    <div class="field-proxy" :class="{ readonly: readonlyRef, hidden: hiddenRef }">
        <div class="field-title" v-if="titleDisabled != true">
            {{ field.title }}
            <span v-if="requiredRef">*</span>
        </div>
        <div class="field-detail">
            <slot :required="requiredRef" :readonly="readonlyRef" :hidden="hiddenRef" />
            <p class="ellipsis desc" v-text="field.description" />
            <p class="ellipsis error" v-text="error" v-if="readonlyRef != true" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, Ref, ref, toRaw, } from "vue";
import { isBoolean, RunResult } from "snail.core";
import { FieldActionOptions, FieldOptions, FieldProxyRenderOptions, FieldStatusOptions, IFieldHandle } from "../../models/field-base";
import { INJECTKEY_GlobalContext, canRunAction, newTraces } from "./field-common";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldProxyRenderOptions>();
const emits = defineEmits<{ rendered: [handle: IFieldHandle] }>();
const { field, emitter } = _;
const global = inject(INJECTKEY_GlobalContext);
//  2、组件交互变量、常量
/**     字段状态 响应式对象，仅包括自身状态信息，不包含全局和容器 */
const statusRef: Ref<FieldStatusOptions> = ref({
    required: field.required == true,
    readonly: field.readonly == true,
    hidden: field.hidden == true,
});
/**     字段是否必填 */
const requiredRef = computed<boolean>(() => statusRef.value.required == true);
/**     字段是否只读 响应时对象，动态计算出全局、容器、字段的只读状态，得到实际只读状态值 */
const readonlyRef = computed<boolean>(() => global.readonly == true || _.readonly == true || statusRef.value.readonly == true);
/**     字段是否隐藏 */
const hiddenRef = computed<boolean>(() => global.mode == "runtime" && statusRef.value.hidden == true);
/**     字段操作句柄：已冻结 */
const handle: IFieldHandle = Object.freeze<IFieldHandle>({
    async getField(): Promise<RunResult<FieldOptions<any>>> {
        /** 设计时，验证字段配置是否正确，不正确则返回失败；其他模式，直接返回字段无需任何验证 */
        let bValue = global.mode == "design" ? await _.validate() : true;
        return bValue
            ? { success: true, data: toRaw(field) }
            : { success: false, reason: _.error };
    },

    async getValue<T>(validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<T>> {
        /** 运行时，返回字段实际值；其他模式，返回字段配置的默认值； */
        let result: RunResult<any> = canRunAction(_, "get-value", traces);
        if (result.success == true) {
            let bValue = validate == true ? await _.validate() : true;
            result = bValue
                ? { success: true, data: toRaw(_.value) }
                : { success: false, reason: _.error };
        }
        return result;
    },
    async setValue<T>(value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
        /*  设置字段值，并判断是否变化，发送对应事件处理    */
        let result: RunResult = canRunAction(_, "set-value", traces);
        if (result.success == true) {
            const oldValue = toRaw(_.value);
            let setResult = await _.setValue(value);
            if (setResult.success == false) {
                setResult.reason = _.error;
            }
            else if (setResult.change == true) {
                traces = newTraces(_, "set-value", "code", traces);
                setTimeout(() => emitter("valueChange", toRaw(_.value), oldValue, traces));
            }
            result = setResult;
        }
        return result;
    },
    getStatus(traces?: ReadonlyArray<FieldActionOptions>): RunResult<FieldStatusOptions> {
        /*还需要验证是否死循环了、、；仅获取状态，直接返回的，死循坏验证先忽略*/
        return {
            success: true, data: {
                required: toRaw(requiredRef.value),
                readonly: toRaw(readonlyRef.value),
                hidden: toRaw(hiddenRef.value)
            }
        };
    },
    setStatus(status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): RunResult {
        let result: RunResult = canRunAction(_, "set-status", traces);
        if (result.success == true && status) {
            //  备份旧的状态，更新新的备份
            const oldStataus = handle.getStatus().data;
            isBoolean(status.required) && (statusRef.value.required = status.required == true);
            isBoolean(status.readonly) && (statusRef.value.readonly = status.readonly == true);
            isBoolean(status.hidden) && (statusRef.value.hidden = status.hidden == true);
            //  判断是否有变化，有变化触发状态改变事件
            const newStatus = handle.getStatus().data;
            const bValue = newStatus.hidden != oldStataus.hidden
                || newStatus.readonly != oldStataus.readonly
                || newStatus.required != oldStataus.required;
            if (bValue == true) {
                traces = newTraces(_, "set-status", "code", traces);
                setTimeout(() => emitter("statusChange", newStatus, oldStataus, traces));
            }
        }
        return result;
    }
});
// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应：组件挂载后，触发【rendered】事件，通知外部做挂接
onMounted(() => emits("rendered", handle));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-proxy {
    width: 100%;
    overflow-x: hidden;
    min-height: 42px;
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;

    // 字段标题+必填标记
    >.field-title {
        width: 120px;
        flex-shrink: 0;
        padding: 12px 0 10px 10px;
        color: #63688e;

        >span {
            color: #f74b4b;
        }
    }

    // 字段详情，追加上 字段描述和验证相关信息
    >.field-detail {
        flex: 1;
        padding: 4px 10px;

        >p.desc,
        >p.error {
            color: #aaa;
            font-size: 12px;
            padding: 0;
            line-height: 20px;
        }

        >p.error {
            color: #f74b4b;
        }
    }
}
</style>