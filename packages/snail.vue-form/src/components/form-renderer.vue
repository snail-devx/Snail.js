<!-- 表单渲染器：作为表单运行时，负责进行表单渲染 
    1、基于设计时生成的表单配置数据进行渲染
    2、支持pc和移动端，支持字段配置、校验等功能
    3、对FieldContainer再次封装，仅爆率运行时渲染器相关功能
-->
<template>
    <FormFields class="snail-form-renderer" :readonly="readonly" :fields="fields || []" :values="values || []"
        :row-index="rowIndexRef" @rendered="emits('rendered', handle)"
        @field-rendered="(field, evt) => emits('fieldRendered', field, evt)"
        @value-change="(field, evt) => emits('valueChange', field, evt)"
        @status-change="(field, evt) => emits('statusChange', field, evt)" />
</template>

<script setup lang="ts">
import { provide, shallowRef, } from "vue";
import { } from "../models/control-model";
import { FormRenderEvents, FormRenderOptions, IFormRenderHandle } from "../models/form-model";
import FormFields from "./common/form-fields.vue";
import { INJECTKEY_GlobalContext, useGlobalContext } from "./common/field-common";
import { DEFAULT_ControlRegistery } from "../utils/control-registery";
import { useFormHandle } from "./common/form-common";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ name: "FormRenderer" });
const _ = defineProps<FormRenderOptions>();
const emits = defineEmits<FormRenderEvents>();
const { fields, values } = _;
//  2、组件交互变量、常量
/**     字段全局上下文：构建后注入方便子组件中直接使用 */
const global = useGlobalContext({
    ..._,
    controls: _.controls || DEFAULT_ControlRegistery,
    layout: "form",
    //  运行时暂时不支持的属性
    hook: undefined,
    defaultSpan: 2,
});
provide(INJECTKEY_GlobalContext, global);
const { readonly } = global;
/**     表单渲染器句柄 */
const handle: IFormRenderHandle = useFormHandle(global) as IFormRenderHandle;

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

const rowIndexRef = shallowRef(0);
// setInterval(() => rowIndexRef.value++, 1000);

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

// 表单渲染器：撑开填充上级控件，并自动出滚动条
.snail-form-renderer {
    position: relative;
    height: 100%;
    width: 100%;
    flex-shrink: 0;
    background-color: white;
    overflow-x: hidden;
    overflow-y: auto;
}
</style>