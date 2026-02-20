<!-- 分组组件：作为控件容器，支持添加子控件进来 
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :type="field.type" :title="null" :description="field.description"
        :="{ manager: manager, error: getError() }">
    </FieldProxy>
</template>

<script setup lang="ts">
import { RunResult } from "snail.core";
import { inject, onMounted, ref, ShallowRef, shallowRef, } from "vue";
import { components } from "snail.vue";
import { FieldEvents, FieldRenderOptions, FieldValueSetResult, IFieldHandle, IFieldManager } from "../../models/field-base";
import { GroupControlSettings, GroupControlValue } from "../../models/control-model";
import { INJECTKEY_GlobalContext, useField } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";
import FormFields from "../common/form-fields.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<FieldRenderOptions<GroupControlSettings, GroupControlValue>>();
const emits = defineEmits<FieldEvents>();
const { Icon } = components;
const global = inject(INJECTKEY_GlobalContext);
const manager: IFieldManager = useField(global, props, {
    emitter: emits,
    getValue(validate: boolean): Promise<RunResult<any>> {
        throw new Error("group control does not support getValue");
    },
    setValue(value: string): Promise<FieldValueSetResult> {
        /** 值有变化，才操作，无变化直接成功即可 */

        throw new Error("group control does not support setValue");
    }
});
const { handle, getError, updateError } = manager;
//  2、组件交互变量、常量
/**     字段值 */
const valueRef: ShallowRef<any> = shallowRef("");
/**     字段管理器 */

//  3、分组实例值相关
/**     分组实例值：index表示第几个实例，每个数组元素表示本组下子控件字段值（key为字段id，value为字段值）*/
const groupValuesRef: ShallowRef<Array<Record<string, any>>> = shallowRef(undefined);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      分组实例值初始化：初始化时，自动初始化一组
global.mode == "design" && (groupValuesRef.value = [Object.create(null)]);

//  2、生命周期响应
onMounted(() => emits("rendered", handle));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-item.group>.field-detail {
    align-items: baseline;
    padding: 0;

    >.group-container {
        position: relative;
        min-height: 100px;
        margin-bottom: 15px;
        border: 1px solid #dddfed;
        border-radius: 4px;

        >.container-toolbar {
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            >* {
                flex-shrink: 0;
                background-color: white;
                margin-right: 6px;
            }

            >.index {
                width: 100px;
                height: 20px;
                color: #63688e;
                padding: 0 10px;
                display: flex;
                align-items: center;
                //  向左撑开
                margin-right: auto;
            }

            >.snail-icon {
                fill: #8a9099;

                &:hover {
                    fill: #279bf1;
                }
            }

        }
    }
}

//  设计时时的特定样式
.field-item.group.design>.field-detail {
    >.group-container {

        //  强制给定z-index，避免分组控件自身的field-cover盖住了
        .snail-form-fields {
            min-height: 200px;
            z-index: 100;
        }
    }
}
</style>