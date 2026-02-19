<!-- 分组组件：作为控件容器，支持添加子控件进来 
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :readonly="readonly" :parent-field-id="parentFieldId" :row-index="rowIndex" :field="field"
        :value="valueRef" :error="errorRef" :="proxy" @rendered="hd => emits('rendered', handle = hd)">
        <!-- 设计时和Form模式 -->
        <template v-if="global.mode == 'design' || global.layout == 'form'" #="{ readonly, required }">
            <div class="group-container" v-for="(gv, index) in groupValuesRef" :data-index="index + 1">
                <FormFields :readonly="readonly" :fields="field.settings.fields" :values="gv" :parent="field"
                    :row-index="index" />
                <!-- 工具栏，运行时和预览时生效：显示当前序号、操作按钮等 -->
                <div class="container-toolbar" v-if="readonly != true">
                    <div class="index" v-text="index + 1" />
                    <Icon :type="'plus'" :="{ size: 20, title: '新增', }" />
                    <Icon :type="'subtract'" :="{ size: 20, title: '删除', }" />
                    <Icon :type="'arrow'" v-if="index != groupValuesRef.length - 1"
                        :="{ size: 24, title: '下移', rotate: 90 }" />
                    <Icon :type="'arrow'" v-if="index != 0" :="{ size: 24, title: '上移', rotate: 270 }" />
                </div>
            </div>
        </template>
        <!-- Table模式的运行时或者预览时 -->
        <template v-else #="{ }">
            其他时刻顶顶顶
        </template>
    </FieldProxy>
</template>

<script setup lang="ts">
import { RunResult } from "snail.core";
import { inject, ref, ShallowRef, shallowRef, } from "vue";
import { FieldEvents, FieldProxyRenderOptions, FieldRenderOptions, IFieldHandle } from "../../models/field-base";
import { GroupControlSettings, GroupControlValue } from "../../models/control-model";
import { INJECTKEY_GlobalContext } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";
import FormFields from "../common/form-fields.vue";
import { components } from "snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldRenderOptions<GroupControlSettings, GroupControlValue>>();
const emits = defineEmits<FieldEvents>();
const global = inject(INJECTKEY_GlobalContext);
const { field } = _;
const { Icon } = components;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     字段值 */
const valueRef: ShallowRef<any> = shallowRef("");
/**     字段错误信息：如字段值验证失败、、、 */
const errorRef: ShallowRef<string> = shallowRef("");
/**     字段操作句柄：字段渲染完成后，由【field-proxy】组件的`rendered`事件传递出来 */
let handle: IFieldHandle = undefined;
/**     字段代理对象部分实现，已冻结 */
const proxy = Object.freeze<Pick<FieldProxyRenderOptions, "titleDisabled" | "emitter" | "getValue" | "setValue">>({
    titleDisabled: false,
    emitter: emits,
    getValue(validate: boolean): Promise<RunResult<any>> {
        // const success: boolean = validate ? validateValue() : true;
        // const rt: RunResult<any> = success
        //     ? { success: true, data: valueRef.value }
        //     : { success: false, reason: errorRef.value };
        // return Promise.resolve(rt);
        throw new Error("group control does not support getValue");
    },
    setValue(value: string): Promise<{ success: boolean, change: boolean }> {
        /** 值有变化，才操作，无变化直接成功即可 */
        // value = getValueString(value);
        // if (value == valueRef.value) {
        //     return Promise.resolve({ success: true, change: false })
        // }
        // //  更新字段值，并进行字段值验证
        // valueRef.value = value;
        // oldText = value;
        // return Promise.resolve(validateValue()
        //     ? { success: true, change: true }
        //     : { success: false, change: false }
        // );
        throw new Error("group control does not support setValue");
    }
});
//  3、分组实例值相关
/**     分组实例值：index表示第几个实例，每个数组元素表示本组下子控件字段值（key为字段id，value为字段值）*/
const groupValuesRef: ShallowRef<Array<Record<string, any>>> = shallowRef(undefined);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      分组实例值初始化：初始化时，自动初始化一组
global.mode == "design" && (groupValuesRef.value = [Object.create(null)]);

//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-proxy.group>.field-detail {
    align-items: baseline;

    >.group-container {
        position: relative;
        min-height: 100px;
        padding-bottom: 15px;
        margin-bottom: 15px;
        border: 1px solid #dddfed;
        border-radius: 4px;

        >.container-header {
            height: 34px;
            display: flex;
            align-items: center;
        }

        >.container-toolbar {
            width: 100%;
            position: absolute;
            height: 30px;
            bottom: -15px;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            >* {
                flex-shrink: 0;
                background-color: white;
                margin-right: 6px;
            }

            >.index {
                width: 20px;
                height: 20px;
                border-radius: 20px;
                border: 1px solid #dddfed;
                color: #8a9099;
                font-size: 12px;
                //  flex 布局：display: flex，align-items、justify-content 都为center
                .flex-center();
                //  向左撑开
                margin-right: auto;
                margin-left: 10px;
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
.field-proxy.group.design>.field-detail {
    >.group-container {

        //  强制给定z-index，避免分组控件自身的field-cover盖住了
        .snail-form-fields {
            min-height: 200px;
            z-index: 100;
        }
    }
}
</style>