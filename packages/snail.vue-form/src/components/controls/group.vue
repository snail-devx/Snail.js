<!-- 分组组件：作为控件容器，支持添加子控件进来 
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :type="field.type" :title="null" :description="field.description"
        :="{ manager: group.fieldManager, error: getError() }">
        <div class="group-item" v-for="(gv, rowIndex) in group.values" :key="getItemKey(gv)">
            <div class="item-header">
                <span class="item-title ellipsis" v-if="global.mode == 'design'" v-text="field.title" />
                <span class="item-title ellipsis" v-else v-text="`${field.title}(${rowIndex + 1})`" />
                <!-- 操作按钮：非设计时、 非只读时才显示：添加、删除、上移、下移-->
                <template v-if="global.mode != 'design' && isReadonly() != true">
                    <Icon :type="'arrow'" :="{ size: 24, title: '下移', rotate: 90 }"
                        v-if="rowIndex != group.values.length - 1 && field.settings.disableSort != true"
                        @click="moveItem(rowIndex, rowIndex + 1)" />
                    <Icon :type="'arrow'" :="{ size: 24, title: '上移', rotate: 270 }"
                        v-if="rowIndex != 0 && field.settings.disableSort != true"
                        @click="moveItem(rowIndex, rowIndex - 1)" />
                    <Icon :type="'plus'" :="{ size: 22, title: field.settings.addActionName || '添加', }"
                        v-if="needAddRef" @click="addNewItem(rowIndex + 1)" />
                    <Icon :type="'subtract'" :="{ size: 22, title: '删除', }" v-if="field.settings.disableDelete != true"
                        @click="onDeleteItem(rowIndex, gv);" />
                </template>
            </div>
            <FormFields :readonly="isReadonly()" :parent="field" :row-index="rowIndex" :fields="group.fields"
                :values="gv" :="buildItemMonitor(gv)" />
        </div>
        <!-- 分组控件的工具栏：显示添加按钮、总计等；若无任何内容，则加一条白线，用于占位盖住表单字段行的最后一条边框线 -->
        <div class="group-toolbar" v-if="isReadonly() != true && needAddRef">
            <Button :type="'link'" :size="'small'" @click="addNewItem()">
                <Icon :type="'plus'" :size="22" :color="'#4c9aff'" />
                <span v-text="field.settings.addActionName || '添加'" />
            </Button>
        </div>
        <div v-else class="group-toolbar none" />
    </FieldProxy>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, ShallowRef, shallowRef, } from "vue";
import { components, usePopup } from "snail.vue";
import FieldProxy from "../common/field-proxy.vue";
import FormFields from "../common/form-fields.vue";
import { GroupControlSettings, GroupControlValue, IGroupControlManager } from "../../models/control-model";
import { FieldEvents, FieldRenderOptions } from "../../models/field-base";
import { } from "../../models/field-container";
import { INJECTKEY_GlobalContext, useField } from "../common/field-common";
import { useGroup } from "../common/group-manager";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<FieldRenderOptions<GroupControlSettings, GroupControlValue>>();
const emits = defineEmits<FieldEvents>();
const global = inject(INJECTKEY_GlobalContext);
const group: IGroupControlManager = useGroup(global, props, emits);
//      解构对象，便捷引入使用
const { Icon, Button, Empty } = components;
const { confirm } = usePopup();
const { getItemKey, buildItemMonitor, addNewItem, moveItem, deleteItem } = group;
const { handle, getError, updateError, isReadonly, isReqired } = group.fieldManager;
//  2、组件交互变量、常量
/**     是否需要添加按钮 */
const needAddRef = computed<boolean>(() => props.field.settings.disableAdd == true
    ? false
    : props.field.settings.maxCount > 0
        ? group.values.length < props.field.settings.maxCount
        : true
);

//  3、分组实例值相关

// *****************************************   👉  方法+事件    ****************************************
/**
 * 删除某行
 * @param rowIndex 删除项的索引位置
 * @param gv 当前行数据
 */
async function onDeleteItem(rowIndex: number, gv: Record<string, any>) {
    const bValue = await confirm("删除提示", `确认要删除第 ${rowIndex + 1} 行数据吗？`);
    bValue && deleteItem(rowIndex);
}


// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听

//  2、生命周期响应
// onMounted(() => emits("rendered", handle));
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

        >.item-header {
            width: 100%;
            height: 32px;
            overflow: hidden;
            color: #63688e;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            padding-right: 10px;

            >.item-title {
                max-width: 50%;
                padding: 0 10px;
                display: flex;
                align-items: center;
                //  向左撑开
                margin-right: auto;
            }

            >.snail-icon {
                opacity: 0.8;
                fill: #8a9099;

                &:hover {
                    fill: #4c9aff;
                }
            }
        }

        >.snail-form-fields {
            width: 100%;
            min-height: 40px;
            overflow-x: hidden;
            overflow-y: visible;
        }
    }

    >.group-toolbar {
        &:not(.none) {
            position: relative;
            height: 32px;
            display: flex;
            align-items: center;
        }

        &.none {
            width: 100%;
            height: 1px;
            position: absolute;
            bottom: 0;
            background-color: white;
        }

        >.snail-button {
            padding: 0 10px;
            width: fit-content;
        }
    }

    >.field-desc,
    >.field-error {
        padding-left: 10px;
    }
}

//  非设计时的特定样式
.field-item.group:not(.design)>.field-detail {
    >.group-item {
        >.snail-form-fields {
            padding-left: 10px;

            >.field-item {
                >.field-title {
                    width: 110px;
                    padding-left: 0;
                }
            }
        }
    }
}

//  设计时时的特定样式
.field-item.group.design {
    padding-right: 0 !important;

    >.field-detail>.group-item {
        border-radius: 0;
        border: 1px solid #dddfed;
        margin-bottom: 2px;

        //  强制z-index，避免group控件自身的工具栏遮挡住了子容器
        >.snail-form-fields {
            min-height: 200px;
            z-index: 100;
        }
    }

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