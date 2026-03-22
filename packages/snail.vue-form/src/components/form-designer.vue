<!-- 表单设计器：作为标案设计时，负责进行表单可视化配置 
 1、支持拖拽布局、组件配置等功能
 2、左侧字段列表，中间区域为设计区域，右侧为字段配置区域
-->
<template>
    <div class="snail-form-designer">
        <!-- 左侧控件列表区域 -->
        <FormControls v-if="readonly != true" @click="onControlItemClick" />
        <!-- 中间字段容器区域 -->
        <FormFields :readonly="readonly" :fields="fields" :row-index="0" @rendered="emits('rendered', handle)"
            @config-change="fields => emits('change', fields)" />
        <!-- 右侧字段配置区域 v-if="global.fieldSetting.getactiveField() != undefined" -->
        <div class="setting-panel" :key="global.fieldSetting.getActiveKey()">
            <Empty v-if="global.fieldSetting.getactiveField() == undefined" message="点击字段激活设置面板" />
            <Dynamic v-else :key="global.fieldSetting.getActiveKey()" :="buildSettingPanelOptions()" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { provide, } from "vue";
import { ComponentOptions, components } from "snail.vue";
import { FieldOptions } from "../models/field-base";
import { FieldContainerLocation, IFieldContainerHandle } from "../models/field-container";
import { FormDesignerOptions, FormDesignerEvents, IFormDesignerHandle } from "../models/form-model";
import { INJECTKEY_GlobalContext, useGlobalContext } from "./common/field-common";
import { useFormHandle } from "./common/form-common";
import { DEFAULT_ControlRegistery } from "../utils/control-registery";
import FormControls from "./common/form-controls.vue";
import FormFields from "./common/form-fields.vue";
import { FieldSettingOptions } from "../models/field-setting";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ name: "FormDesigner" });
const _ = defineProps<FormDesignerOptions>();
const { Dynamic, Empty } = components;
const { fields } = _;
const emits = defineEmits<FormDesignerEvents>();
/**     字段全局上下文：构建后注入方便子组件中直接使用 */
const global = useGlobalContext({
    ..._,
    controls: _.controls || DEFAULT_ControlRegistery,
    mode: "design",
    initialDisabled: true,
    layout: "form"
});
provide(INJECTKEY_GlobalContext, global);
const { readonly } = global;
/**     表单渲染器句柄 */
const handle: IFormDesignerHandle = useFormHandle(global) as IFormDesignerHandle;

//  测试rowIndex向下传递的响应式可行性：可行
// const rowIndexRef: ShallowRef<number> = shallowRef(0);
// setInterval(() => rowIndexRef.value++, 1000);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 控件项点击时
 * @param type 控件类型
 */
function onControlItemClick(type: string) {
    const handle = global.getContainer(undefined);
    if (handle == undefined) {
        alert("表单正在渲染中，请稍后...");
        return;
    }
    //  这里取巧，仅构建type属性值，其他的内部会做处理
    handle.addField({ type: type } as any);
}
/**
 * 构建字段配置面板
 * @returns 字段配置面板组件及绑定属性
 */
function buildSettingPanelOptions(): ComponentOptions & FieldSettingOptions<any> {
    const { field, container } = global.fieldSetting.getactiveField();
    const handle: IFieldContainerHandle = global.getContainer(container);
    return {
        ...global.getControl(field.type).settingComponent,
        readonly: global.readonly,
        field, container: handle
    };
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-form-designer {
    position: relative;
    border: 1px solid #e1e2e3;
    background-color: rgb(245, 245, 245);
    box-shadow: 0px 0px 6px 0px rgba(46, 48, 51, 0.14);
    display: flex;
    //  width:100%；height:100%；overflow: hidden
    .wh-fill-hidden();

    >div {
        background: white;
    }

    //  左侧控件区域
    >.snail-form-controls {
        width: 300px;
        border-right: 1px solid #e1e2e3;
    }

    //  中间字段区域
    >.snail-form-fields {
        margin: 10px;
        flex: 1;
        overflow-x: hidden;
        overflow-y: auto;
    }

    //  右侧字段配置区域：强制绝对定位，不参与flex布局
    >.setting-panel {
        // position: absolute;
        width: 300px;
        // right: 0;
        // top: 0;
        border-left: 1px solid #e1e2e3;
        // box-shadow: 0px 0px 6px 0px rgba(46, 48, 51, 0.14);
        //  强制z-index，避免底下影响
        // z-index: 500;
    }
}
</style>