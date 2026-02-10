<!-- 数值控件
    1、使用 FieldProxy 代理部分逻辑
    2、往代理组件传递参数时，直接使用上层属性，不中转，避免破坏响应式
-->
<template>
    <FieldProxy :readonly="readonly" :parent-field-id="parentFieldId" :row-index="rowIndex" :field="field"
        :value="valueRef" :error="errorRef" :="proxy" @rendered="hd => emits('rendered', handle = hd)">
        <template #="{ required, readonly, hidden }">
            <div class="number-panel" v-bind:class="{ 'has-prefix': hasPrefix, 'has-suffix': hasSuffix }">
                <!-- 前缀 -->
                <div class="number-prefix placeholder" v-if="isStringNotEmpty(field.settings.prefix)"
                    v-text="field.settings.prefix" />
                <!-- 文本输入区域+控制器 -->
                <div class="input-panel" :class="controlsLayout">
                    <input type="text" />
                    <!-- 步长控制按钮:不同样式,做不同按钮效果,采用不同模块实现 -->
                    <template v-if="field.settings.controls == 'default'">
                        <div class="controls default subtract">
                            <Icon :type="'subtract'" :size="20" />
                        </div>
                        <div class="controls default plus">
                            <Icon :type="'plus'" :size="20" />
                        </div>
                    </template>
                    <template v-else-if="field.settings.controls == 'right'">
                        <div class="controls right subtract">
                            <Icon :type="'arrow'" :size="20" :rotate="270" />
                        </div>
                        <div class="controls right plus">
                            <Icon :type="'arrow'" :size="20" :rotate="90" />
                        </div>
                    </template>
                </div>
                <!-- 后缀 -->
                <div class="number-suffix placeholder" v-if="isStringNotEmpty(field.settings.suffix)"
                    v-text="field.settings.suffix" />
            </div>
            <!-- 大写区域 -->
            封装一个number通用控件,完成上述的功能
        </template>
    </FieldProxy>
</template>

<script setup lang="ts">
import { inject, onMounted, ShallowRef, shallowRef, watch, } from "vue";
import { ChooseItem, components, SelectItem, SelectOptions } from "snail.vue";
import { NumberControlSettings, OptionControlSettings, OptionControlValueItem } from "../../models/control-model";
import { FieldEvents, FieldProxyRenderOptions, FieldRenderOptions, IFieldHandle, } from "../../models/field-base";
import { INJECTKEY_GlobalContext, newTraces } from "../common/field-common";
import FieldProxy from "../common/field-proxy.vue";
import { isArrayNotEmpty, isStringNotEmpty, newId } from "snail.core";
// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldRenderOptions<NumberControlSettings, number>>();
const emits = defineEmits<FieldEvents>();
const { Icon } = components;
const global = inject(INJECTKEY_GlobalContext);
const { field } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     已选选择项：field-proxy需要 */
const valueRef = shallowRef<OptionControlValueItem[]>();
/**     字段错误信息：如字段值验证失败、、、 */
const errorRef: ShallowRef<string> = shallowRef("");
/**     是否是多选 */
const isMultiple: boolean = field.type == "Checkbox";
/**     字段操作句柄：字段渲染完成后，由【field-proxy】组件的`rendered`事件传递出来 */
let handle: IFieldHandle = undefined;
//  3、选项相关
const hasPrefix: boolean = isStringNotEmpty(field.settings.prefix);
const hasSuffix: boolean = isStringNotEmpty(field.settings.suffix);
const controlsLayout: NumberControlSettings["controls"] = _.readonly == true ? "disabled" : (field.settings.controls || "disabled")

/**     字段代理对象部分实现，已冻结 */
const proxy = Object.freeze<Pick<FieldProxyRenderOptions, "titleDisabled" | "emitter" | "getValue" | "setValue">>({
    titleDisabled: false,
    emitter: emits,
    getValue(validate: boolean): Promise<any> {
        throw new Error("");
    },
    setValue(values: OptionControlValueItem[]): Promise<{ success: boolean, change: boolean }> {
        throw new Error("");
    },
});


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.field-proxy.number>.field-detail {
    >.number-panel {
        position: relative;
        height: 34px;
        overflow: hidden;
        display: flex;
        flex-wrap: nowrap;
        align-items: stretch;

        >.number-prefix,
        >.number-suffix {
            flex-shrink: 0;
            line-height: 32px;
            padding: 0px 10px;
            max-width: 100px;
            user-select: none;
            color: #555;
            background-color: #f5f7fa;
            border: 1px solid #dddfed;
        }

        >.number-prefix {
            border-right: none;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
        }

        >.number-suffix {
            border-left: none;
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }
    }

    //  数值输入区域相关样式
    >.number-panel>.input-panel {
        flex: 1;
        position: relative;

        //  控制器相关
        >.controls {
            user-select: none;
            position: absolute;
            background-color: #f5f7fa;
            width: 30px;
            display: flex;
            align-items: center;
            justify-content: center;

            >svg.snail-icon {
                fill: #8a9099;

                &:hover {
                    fill: #3292ea;
                }
            }

            //  默认模式：左右两侧+-号
            &.default {
                top: 1px;
                height: calc(100% - 2px);

                &.subtract {
                    left: 1px;
                    border-right: 1px solid #dddfed;
                    border-top-left-radius: 4px;
                    border-bottom-left-radius: 4px;
                }

                &.plus {
                    right: 1px;
                    border-left: 1px solid #dddfed;
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                }
            }

            //  右侧模式：+ - 都在右侧
            &.right {
                right: 1px;
                height: calc(50% - 1px);
                border-left: 1px solid #dddfed;

                &.subtract {
                    top: 1px;
                    border-top-right-radius: 4px;
                }

                &.plus {
                    top: 50%;
                    border-top: 1px solid #dddfed;
                    border-bottom-right-radius: 4px;
                }
            }
        }
    }

    //  输入框区域,有步长控制器时,input padding适配
    >.number-panel>.input-panel {
        &.default>input {
            padding-left: 40px;
            padding-right: 40px;
        }

        &.right>input {
            padding-right: 40px;
        }
    }
}

//  有前后缀时，input输入框的适配样式
.field-proxy.number>.field-detail {
    >.number-panel.has-prefix {
        >.input-panel>input {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
    }

    >.number-panel.has-suffix {
        >.input-panel>input {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
    }
}
</style>