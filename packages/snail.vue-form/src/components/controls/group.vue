<!-- 分组组件：作为控件容器，支持添加子控件进来 
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :type="field.type" :title="null" :description="field.description"
        :="{ manager: manager, error: getError() }">
        <div class="group-item" v-for="(gv, rowIndex) in groupValuesRef" :key="getKey(gv)">
            <div class="item-header">
                <span class="item-title ellipsis" v-if="global.mode == 'design'" v-text="field.title" />
                <span class="item-title ellipsis" v-else v-text="`${field.title}(${rowIndex + 1})`" />
                <!-- 操作按钮：非设计时、 非只读时才显示：添加、删除、上移、下移-->
                <template v-if="global.mode != 'design' && isReadonly() != true">
                    <Icon :type="'plus'" :="{ size: 24, title: '新增', }" v-if="field.settings.disableAdd != true" />
                    <Icon :type="'subtract'" :="{ size: 24, title: '删除', }"
                        v-if="field.settings.disableDelete != true" />
                    <Icon :type="'arrow'" :="{ size: 24, title: '下移', rotate: 90 }"
                        v-if="rowIndex != groupValuesRef.length - 1 && field.settings.disableSort != true" />
                    <Icon :type="'arrow'" :="{ size: 24, title: '上移', rotate: 270 }"
                        v-if="rowIndex != 0 && field.settings.disableSort != true" />
                </template>
            </div>
            <FormFields :readonly="isReadonly()" :parent="field" :row-index="rowIndex" :fields="fields" :values="gv"
                @rendered="handle => onFieldsRendered(rowIndex, handle)"
                @field-rendered="(field, evt) => onFieldRendered(rowIndex, field, evt)"
                @config-change="fields => onFieldsConfigChange(rowIndex, fields)"
                @value-change="(field, evt) => onFieldValueChange(rowIndex, field, evt)"
                @status-change="(field, evt) => onFieldStatusChange(rowIndex, field, evt)" />
        </div>
        <div class="group-toolbar" v-if="isReadonly() != true && field.settings.disableAdd != true">
            <Button :type="'link'" :size="'small'">
                <Icon :type="'plus'" :size="22" :color="'#4c9aff'" />
                <span v-text="field.settings.addActionName || '添加'" />
            </Button>
        </div>
    </FieldProxy>
</template>

<script setup lang="ts">
import { event, isArrayNotEmpty, RunResult, useKey } from "snail.core";
import { inject, onMounted, ref, ShallowRef, shallowRef, } from "vue";
import { components } from "snail.vue";
import { GroupControlSettings, GroupControlValue } from "../../models/control-model";
import { FieldChangeEvent, FieldEvents, FieldOptions, FieldRenderOptions, FieldStatusOptions, FieldValueSetResult, IFieldHandle, IFieldManager } from "../../models/field-base";
import { IFieldContainerHandle } from "../../models/field-container";
import { INJECTKEY_GlobalContext, useField } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";
import FormFields from "../common/form-fields.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<FieldRenderOptions<GroupControlSettings, GroupControlValue>>();
const emits = defineEmits<FieldEvents>();
const { getKey, deleteKey } = useKey();
const { Icon, Button } = components;
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
const { handle, getError, updateError, isReadonly, isReqired } = manager;
//  2、组件交互变量、常量

//  3、分组实例值相关
/**     分组中子字段集合 */
const fields: FieldOptions<any>[] = isArrayNotEmpty(props.field.settings.fields)
    ? [...props.field.settings.fields]
    : [];
/**     分组实例值：index表示第几个实例，每个数组元素表示本组下子控件字段值（key为字段id，value为字段值）*/
const groupValuesRef: ShallowRef<Array<Record<string, any>>> = shallowRef(undefined);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 分组实例中所有字段渲染完成时
 * @param rowIndex 分组实例索引
 * @param handle 实例组容器句柄
 */
function onFieldsRendered(rowIndex: number, handle: IFieldContainerHandle) {
    console.log("分组实例渲染完成时", rowIndex, handle);
}
/**
 * 分组实例中指定字段渲染完成时
 * @param rowIndex 分组实例索引
 * @param field 
 * @param evt 
 */
function onFieldRendered(rowIndex: number, field: FieldOptions<any>, evt: FieldChangeEvent) {
    console.log("分组实例中字段渲染完成时", rowIndex, field, evt);
}
/**
 * 分组实例中配置改变时
 * - 设计时生效
 * @param rowIndex 分组实例索引
 * @param field 分组实例容器包含的所有字段
 */
function onFieldsConfigChange(rowIndex: number, field: FieldOptions<any>[]) {
    console.log("分组实例中配置改变时", rowIndex, field);
}
/**
 * 分组实例中字段值改变时
 * @param rowIndex 分组实例索引
 * @param field 改变值的字段
 * @param evt fend字段值改变事件，包含新旧值和追踪信息
 */
function onFieldValueChange(rowIndex: number, field: FieldOptions<any>, evt: FieldChangeEvent<any>) {
    console.log("分组实例中字段值改变时", rowIndex, field, evt);
}
/**
 * 分组实例中字段状态改变时
 * @param rowIndex 分组实例索引
 * @param field 改变状态的字段
 * @param evt 字段状态改变事件，包含新旧状态和追踪信息
 */
function onFieldStatusChange(rowIndex: number, field: FieldOptions<any>, evt: FieldChangeEvent<FieldStatusOptions>) {
    console.log("分组实例中字段状态改变时", rowIndex, field, evt);
}

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

    >.group-item {
        position: relative;
        border-radius: 4px;
        margin-bottom: 2px;

        >.item-header {
            width: 100%;
            height: 32px;
            overflow: hidden;
            color: #63688e;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            flex-wrap: nowrap;

            >.item-title {
                max-width: 50%;
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

        >.snail-form-fields {
            width: 100%;
            min-height: 40px;
            overflow-x: hidden;
            overflow-y: visible;
        }

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

    >.group-toolbar {
        position: relative;
        height: 32px;
        display: flex;
        align-items: center;

        >.snail-button {
            padding: 0 10px;
            width: fit-content;
        }
    }
}

//  设计时时的特定样式
.field-item.group.design {
    padding-right: 0 !important;

    >.field-detail>.group-item {
        border: 1px solid #dddfed;
        border-radius: 0;

        //  强制z-index，避免group控件自身的工具栏遮挡住了子容器
        >.snail-form-fields {
            min-height: 200px;
            z-index: 100;
        }
    }

    // &:hover>.field-detail>.group-item {
    //     >.item-header>.snail-icon {
    //         display: none;
    //     }
    // }

    >.field-detail>.group-toolbar {
        z-index: 100;
    }

    //  分组控件的设计时工具栏操作按钮放到顶部，避免和子字段的操作按钮冲突遮盖
    >.field-toolbar {
        align-items: flex-start;
        padding-top: 4px;
    }
}
</style>