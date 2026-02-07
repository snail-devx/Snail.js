<!-- 字段设置代理组件 -->
<template>
    <div class="field-setting-proxy">
        <!-- 字段类型配置、、、 -->
        <div class="setting-item divider">
            <div class="item-title">ID</div>
            <div class="item-detail placeholder" v-text="field.id" />
        </div>
        <div class="setting-item divider">
            <div class="item-title">类型</div>
            <div class="item-detail placeholder" v-text="`${name}(${type})`" />
        </div>
        <div class="setting-divider" />
        <!-- 插槽，进行字段详细配置 -->
        <slot />
    </div>
</template>

<script setup lang="ts">
import { inject, ref, shallowRef, } from "vue";
import { FieldSettingOptions } from "../../models/field-setting";
import { INJECTKEY_GlobalContext } from "./field-common";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { field } = defineProps<FieldSettingOptions<any>>();
const global = inject(INJECTKEY_GlobalContext);
const { name, type } = global.getControl(field.type);

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-setting-proxy {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 6px 0;

    .setting-item {
        margin: 6px 12px;
        display: flex;
        align-items: stretch;
        flex-wrap: wrap;

        .placeholder {
            color: #8a9099 !important;
        }

        >.item-title,
        >.item-detail {
            min-height: 32px;
            display: flex;
            align-items: center;
        }

        >.item-title {
            width: 80px;
            flex-shrink: 0;
            color: #606266;
        }

        >.item-detail {
            flex: 1;

            &.right {
                justify-content: flex-end;
            }
        }

        >.item-error {
            font-size: 13px;
            color: #f74b4b;
            padding: 4px 0 0 80px;
            width: 100%;
        }

        //  特定控件样式
        textarea {
            height: 80px;
        }

        .snail-select {
            >.select-result {
                padding-left: 10px;
            }
        }

    }

    //  一个配置多行时
    .setting-item.multiple {
        >.item-title {
            align-self: flex-start;
        }
    }

    //  分割线
    .setting-divider {
        width: 100%;
        height: 10px;
        background-color: #e1e2e3;
        opacity: 0.6;
    }

}
</style>