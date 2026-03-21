<!-- 字段设置代理组件 -->
<template>
    <Motion :effect="MOTION.fade">
        <div class="field-setting-proxy">
            <!-- 字段类型配置、、、 -->
            <div class="setting-item divider">
                <div class="item-title">字段ID</div>
                <div class="item-detail placeholder" v-text="field.id" />
            </div>
            <div class="setting-item divider">
                <div class="item-title">控件类型</div>
                <div class="item-detail placeholder" v-text="`${name}(${type})`" />
            </div>
            <!-- <div class="setting-divider" /> -->
            <!-- 插槽，进行字段详细配置 -->
            <slot />
        </div>
    </Motion>
</template>

<script setup lang="ts">
import { inject, ref, shallowRef, } from "vue";
import { components, MOTION } from "snail.vue";
import { FieldSettingOptions } from "../../models/field-setting";
import { INJECTKEY_GlobalContext } from "./field-common";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { field, container } = defineProps<FieldSettingOptions<any>>();
const { Motion, } = components;
const global = inject(INJECTKEY_GlobalContext);
const { name, type } = global.getControl(field.type);

//  2、组件交互变量、常量
defineExpose({ update, refresh });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 更新字段设置项
 * - 更新完成后，同步刷新字段
 * @param key 设置项key
 * @param keyInSettings key是否是在field.settings中，false时，则是`field`的直属苏还行
 * @param value 设置项值
 */
function update(key: string, keyInSettings: boolean, value: any) {
    /** 设置项值，为undefined时，则删除此设置项 */
    if (value == undefined) {
        keyInSettings
            ? delete field.settings[key]
            : delete field[key];
    }
    else {
        keyInSettings
            ? field.settings[key] = value
            : field[key] = value;
    }
    refresh();
}
/**
 * 刷新字段
 */
function refresh() {
    container.refresh(field.id, field);
}

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
    transition-duration: 400ms !important;

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

        >.item-title.question {
            cursor: help;
            text-decoration: underline;
            text-decoration-style: dashed;
            text-underline-offset: 4px;
        }

        >.item-detail {
            flex: 1;
            overflow: hidden;
            position: relative;

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

        input {
            height: 32px !important;
        }

        // input[readonly] {
        //     border: none;
        //     padding-left: 0;
        // }

        .snail-select {
            >.select-result {
                padding-left: 10px;
            }

            //  只读时的特定样式处理
            // &.readonly {
            //     border: none;

            //     >.select-result {
            //         padding-left: 0;
            //     }
            // }
        }

        .snail-choose {
            >.choose-item {
                margin-right: 0;
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