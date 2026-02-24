<!-- 分组控件的设置 -->
<template>
    <FieldSettingProxy :="_" ref="setting-proxy">
        <div class="setting-divider" />
        <FieldTitle :="_" />
        <FieldLikeText title="字段说明" :readonly="readonly" :value="field.description"
            @change="value => proxy.update('description', false, value)" />
        <div class="setting-divider" />
        <FieldLikeBoolean title="必填" :readonly="readonly" :value="field.required"
            @change="value => proxy.update('required', false, value)" />
        <FieldLikeBoolean title="只读" :readonly="readonly" :value="field.readonly"
            @change="value => proxy.update('readonly', false, value)" />
        <FieldLikeBoolean title="隐藏" :readonly="readonly" :value="field.hidden"
            @change="value => proxy.update('hidden', false, value)" />
        <div class="setting-divider" />
        <FieldLikeNumber title="最大条数" :readonly="readonly" :min-value="0" :precision="0"
            :value="field.settings.maxCount || 0" :help="propertyHelps.maxCount"
            @change="value => proxy.update('maxCount', true, value)" />
        <FieldLikeNumber title="初始化条数" :readonly="readonly" :min-value="0" :precision="0"
            :value="field.settings.initCount == undefined ? 1 : field.settings.initCount"
            :help="propertyHelps.initCount" @change="value => proxy.update('initCount', true, value)" />
        <div class="setting-divider" />
        <FieldLikeBoolean title="启用统计" :readonly="readonly" :value="field.settings.totalEnabled"
            :help="propertyHelps.totalEnabled" @change="value => proxy.update('totalEnabled', true, value)" />
        <FieldLikeBoolean title="启用添加" :readonly="readonly" :value="!field.settings.disableAdd"
            :help="propertyHelps.disableAdd" @change="value => proxy.update('disableAdd', true, !value)" />
        <FieldLikeBoolean title="启用删除" :readonly="readonly" :value="!field.settings.disableDelete"
            :help="propertyHelps.disableDelete" @change="value => proxy.update('disableDelete', true, !value)" />
        <FieldLikeBoolean title="启用排序" :readonly="readonly" :help="propertyHelps.disableSort"
            :value="!field.settings.disableSort" @change="value => proxy.update('disableSort', true, !value)" />
        <FieldLikeText title="添加按钮名" :readonly="readonly" :help="propertyHelps.addActionName" :placeholder="'添加'"
            :value="field.settings.addActionName" @change="value => proxy.update('addActionName', true, value)" />
    </FieldSettingProxy>
</template>

<script setup lang="ts">
import { ref, shallowRef, useTemplateRef, } from "vue";
import { FieldSettingOptions } from "../../models/field-setting";
import { GroupControlSettings } from "../../models/control-model";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldLikeNumber from "./atoms/field-like-number.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<GroupControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { field, readonly } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     属性帮助信息字段，key为属性名，value为帮助信息说明 */
const propertyHelps = Object.freeze({
    totalEnabled: ["若启用，则对子字段中的【Number】控件求和展示"].join("\n"),
    disableAdd: ["是否显示【添加】按钮"].join("\n"),
    disableDelete: ["是否显示【删除】按钮"].join("\n"),
    disableSort: ["是否可对数据进行【上移】、【下移】排序操作"].join("\n"),
    maxCount: ["能够新建的数据最大条数", "0 表示不限制"].join("\n"),
    initCount: ["控件无值时，自动初始化构建的数据条数", "0 表示不自动初始化"].join("\n"),
    addActionName: "底部【添加】操作按钮名称，默认为‘添加’",
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