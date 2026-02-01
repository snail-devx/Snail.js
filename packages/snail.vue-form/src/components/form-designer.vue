<!-- 表单设计器：作为标案设计时，负责进行表单可视化配置 
 1、支持拖拽布局、组件配置等功能
 2、左侧字段列表，中间区域为设计区域，右侧为字段配置区域
-->
<template>
    <div class="snail-form-designer">
        <!-- 左侧控件列表区域 -->
        <FormControls v-if="global.readonly != true" @click="onControlItemClick" />
        <!-- 中间字段容器区域 -->
        <FormFields :readonly="readonly" :fields="fields" @rendered="handle => containerHandle = handle" />
        <!-- 右侧字段配置区域 -->
        <div class="setting-panel">字段设置</div>
    </div>
</template>

<script setup lang="ts">
import { provide, } from "vue";
import { components } from "snail.vue";
import { IFieldContainerHandle, IFieldGlobalContext } from "../models/field-model";
import { FormDesignEvents, FormDesignOptions } from "../models/form-model";
import FormControls from "./common/form-controls.vue";
import FormFields from "./common/form-fields.vue";
import { INJECTKEY_GlobalContext, useGlobalContext } from "./common/field-share";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ name: "FormDesigner" });
const _ = defineProps<FormDesignOptions>();
const emits = defineEmits<FormDesignEvents>();
const { Scroll, Search, Sort } = components;
/**     字段全局上下文：构建后注入方便子组件中直接使用 */
const global: IFieldGlobalContext = useGlobalContext({
    ..._,
    controls: _.controls,
    mode: "design",
    layout: "form"
});
provide(INJECTKEY_GlobalContext, global);
/**     字段容器操作句柄 */
let containerHandle: IFieldContainerHandle = undefined;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 控件项点击时
 * @param type 控件类型
 */
function onControlItemClick(type: string) {
    if (containerHandle == undefined) {
        alert("表单正在渲染中，请稍后...");
        return;
    }
    //  这里取巧，仅构建type属性值，其他的内部会做处理
    containerHandle.addField({ type: type } as any);
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
    background-color: white;
    border: 1px solid #e1e2e3;
    box-shadow: 0px 0px 6px 0px rgba(46, 48, 51, 0.14);
    display: flex;
    //  width:100%；height:100%；overflow: hidden
    .wh-fill-hidden();

    >div {
        height: 100%;
        background: inherit;
    }

    //  左侧控件区域
    >.snail-form-controls {
        width: 300px;
    }

    //  中间字段区域
    >.snail-form-fields {
        padding: 10px;
        flex: 1;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
    }

    //  右侧字段配置区域：强制绝对定位，不参与flex布局
    >.setting-panel {
        position: absolute;
        width: 300px;
        right: 0;
        top: 0;
        box-shadow: 0px 0px 6px 0px rgba(46, 48, 51, 0.14);
    }
}
</style>