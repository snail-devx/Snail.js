<!-- 数值控件
    1、支持精度、前后缀、大写、千位符、步长控制等功能
    2、最大值、最小值功能，具体效果由外部自己控制，这里仅提示出来超过最大值、最小值、、、
      - 通过事件提示出来
    3、通过v-model双向绑定外部数值
  -->
<template>
  <div class="snail-number" :class="{ 'has-prefix': hasPrefix, 'has-suffix': hasSuffix }">
    <!-- 前缀、输入框、后缀区域 -->
    <div class="number-prefix" v-if="hasPrefix">
      <span class="ellipsis" v-text="prefix" />
    </div>
    <div class="input-panel" :class="controls">
      <input type="text" ref="input" :inputmode="precision > 0 ? 'decimal' : 'numeric'"
        :placeholder="readonly ? '' : placeholder" :title="displayValueRef" v-model="displayValueRef"
        @focus="needBackSection = true" @paste="needBackSection = false" @blur="formatOnEnd(true)" />
      <!-- 步长控制按钮:不同样式,做不同按钮效果,采用不同模块实现 -->
      <template v-if="controls == 'default'">
        <div class="controls default subtract" @click="onStepClick(false)">
          <Icon type="subtract" button :size="20" />
        </div>
        <div class="controls default plus" @click="onStepClick(true)">
          <Icon type="plus" button :size="20" />
        </div>
      </template>
      <template v-else-if="controls == 'right'">
        <div class="controls right plus" @click="onStepClick(true)">
          <Icon type="arrow" button :size="20" :rotate="270" />
        </div>
        <div class="controls right subtract" @click="onStepClick(false)">
          <Icon type="arrow" button :size="20" :rotate="90" />
        </div>
      </template>
    </div>
    <div class="number-suffix" v-if="hasSuffix">
      <span class="ellipsis" v-text="suffix" />
    </div>
    <!-- 数据的工具助手区域；强制换行：大写、千位符、、、 -->
    <div class="number-util ellipsis" v-if="upper" :title="upperTextRef" v-text="`大写：${upperTextRef || ''}`" />
    <div class="number-util ellipsis" v-if="thousands == 'below'" :title="thousandsTextRef"
      v-text="`千分位：${thousandsTextRef || ''}`" />
  </div>
</template>

<script setup lang="ts">
import { isStringNotEmpty } from "snail.core";
import { nextTick, ShallowRef, shallowRef, useTemplateRef, } from "vue";
import { NumberEvents, NumberFormatResult, NumberOptions } from "./models/number-model";
import { useReactive } from "./reactive";
import { useFormatter } from "./components/number-formatter";
import Icon from "./icon.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<NumberOptions>();
const emits = defineEmits<NumberEvents>();
const valueModel = defineModel<number>();
const inputDom = useTemplateRef("input");
const { watcher } = useReactive();
const formatter = useFormatter(_);
//  2、组件交互变量、常量
const { readonly, prefix, suffix, } = _;
const {
  precision, upper, thousands,
  format, checkThreshold, buildUpper, buildThousands, calcByStep
} = formatter;
/**   是否有数值前缀 */
const hasPrefix: boolean = isStringNotEmpty(prefix);
/**   是否有数值后缀 */
const hasSuffix: boolean = isStringNotEmpty(suffix);
/**   数值控制器：只读时禁用控制器功能 */
const controls: NumberOptions["controls"] = readonly == true ? "disabled" : (_.controls || "disabled");
//  3、文本框的数值渲染相关
/**   数值的展示值：经过千分位的处理的值*/
const displayValueRef: ShallowRef<string> = shallowRef();
/**   千分位处理后的值 */
const thousandsTextRef: ShallowRef<string> = shallowRef();
/**   大写后的值 */
const upperTextRef: ShallowRef<string> = shallowRef();
/**   原始数值，没发送change事件前的值，发送change事件后，以最新值覆盖过来，用于判断当前输入值是否改变了*/
let originNumber: number = valueModel.value;
/**   最新数值，随着输入实时更新 */
let latestNumber: number = valueModel.value;
/**   是否需要备份光标位置 */
let needBackSection: boolean;
/**   忽略当前值变化 */
let ignoreCurValueChange: boolean;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 重置数值的显示值
 * - 自动进行 ignoreCurValueChange 管理，避免重复循坏触发
 * @param newValue 
 * @returns 设置是否成功，新值和现有值不等，则返回true
 */
function resetDisplayValue(newValue: string): boolean {
  if (displayValueRef.value !== newValue) {
    ignoreCurValueChange = true;
    displayValueRef.value = newValue;
    setTimeout(() => ignoreCurValueChange = false, 0);
    return true;
  }
  return false;
}
/**
 * 格式化输入文本
 * - 格式化千分符和转大写
 * - 行内千分符时，自动更新渲染到文本框中
 * @param text 输入框文本值
 * @param isEnd 是否是输入结束时，为true时，将处理数值精度等
 * @param onInValid 回调：输入文本无效，不是合法数值时
 * @param onResetDisplay 回调：需要重置文本输入框显示值时，如格式化千分位、、、、
 */
function formatInput(text: string, isEnd: boolean, onInValid?: () => void, onResetDisplay?: () => void): NumberFormatResult {
  //  格式化文本，若发生错误，则发送事件通知外面，先不做任何处理，等待重新输入修正
  const result = format(text, isEnd);
  if (result.error) {
    emits("error", result.error);
    return;
  }
  latestNumber = result.number;
  //  1、值无效，则执行回调处理；若无数值，则取消大写和千分位
  if (result.valid != true) {
    onInValid && onInValid();
  }
  //  2、值有效，但无数值时，特定情况下，如开始输入时，仅输入了 "-"，此时重置大写、千分位等
  else if (result.number === undefined || isNaN(result.number) == true) {
    upperTextRef.value = "";
    thousandsTextRef.value = "";
  }
  //  3、值有效，且有number值时，进行格式化处理，得到大写值和千分位值（千分位仅处理整数部分）
  else {
    upperTextRef.value = buildUpper(result);
    thousandsTextRef.value = buildThousands(result);
    thousands == "inline"
      ? resetDisplayValue(thousandsTextRef.value) && onResetDisplay && onResetDisplay()
      : resetDisplayValue(result.text) && onResetDisplay && onResetDisplay();
  }

  return result;
}
/**
 * 验证数值范围
 * - 基于 latestNumber 进行最大值、最小值验证
 * - 并将 latestNumber 更新成最新值
 */
function validateRange(): void {
  const check = checkThreshold(latestNumber);
  check.belowMin == true && emits("belowMin", latestNumber, formatter.minValue);
  check.exceedMax == true && emits("exceedMax", latestNumber, formatter.maxValue);
  latestNumber = check.number;
}
/**
 * 备份输入框光标位置
 * @returns 光标还原方法
 */
function bakSectionStart(): { restore: (offset: number) => void } {
  const inputSectionStart = inputDom.value ? inputDom.value.selectionStart : null;
  return {
    restore(offset: number) {
      inputSectionStart != null && needBackSection && nextTick(() => {
        const newPosition = inputSectionStart + (offset == undefined ? 0 : offset);
        inputDom.value.setSelectionRange(newPosition, newPosition)
      });
    }
  }
}

/**
 * 输入完成后格式化数值
 * @param triggerChangeEvent 是否触发值改变事件
 */
function formatOnEnd(triggerChangeEvent: boolean) {
  /** 检测阈值；格式化值显示，并尝试触发值改变事件；这里仅作收尾工作，所有的值变化逻辑，都在 `watcher(displayValueRef,` 中处理了*/
  needBackSection = false;
  validateRange();
  formatInput(String(latestNumber), true, () => {
    latestNumber = undefined;
    resetDisplayValue("");
  });
  //  将值同步到v-model，并更新原始值，根据需要触发change事件
  valueModel.value = latestNumber;
  const hasChange: boolean = originNumber != latestNumber;
  const oldValue = originNumber;
  originNumber = latestNumber;
  hasChange && triggerChangeEvent && emits("change", originNumber, oldValue);
}

/**
 * 点击步长控制按钮
 * @param isPlus true为+，false为-
 */
function onStepClick(isPlus: boolean) {
  latestNumber = calcByStep(latestNumber, isPlus);
  formatOnEnd(true);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//    若存在原始值，则先进行一下格式化
originNumber !== undefined && formatOnEnd(false);
//    监听v-model值变化，实时反馈给上下文：作为外部修改值的同步，不做change触发
watcher(valueModel, (newValue, oldValue) => {
  if (newValue !== latestNumber) {
    latestNumber = newValue;
    formatOnEnd(false);
  }
});
//    监听显示值的变化，将无效字符强制剔除掉
watcher(displayValueRef, (newValue, oldValue) => {
  //  格式化数值做展示：备份光标位置，方便例外情况还原
  const bak = bakSectionStart();
  oldValue == undefined && (oldValue = "");
  ignoreCurValueChange || formatInput(newValue, false,
    //  输入值无效时，修改为旧值，然后重新定位光标
    () => {
      latestNumber = valueModel.value;
      resetDisplayValue(oldValue);
      bak.restore(oldValue.length - newValue.length);
    },
    //  重新设置了文本显示值时，重新定位光标位置
    () => bak.restore(displayValueRef.value.length - newValue.length)
  );
  valueModel.value = latestNumber;
});
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-number {
  width: 100%;
  min-height: 32px;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-content: baseline;
}

//  第一行：前后缀样式
.snail-number {

  >.number-prefix,
  >.number-suffix {
    flex-shrink: 0;
    padding: 0px 10px;
    max-width: 100px;
    user-select: none;
    color: #555;
    background-color: #f5f7fa;
    border: 1px solid #dddfed;
    display: flex;
    align-items: center;
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

//  第一行：数值输入区域：文本输入框+步长控制器
.snail-number {
  >.input-panel {
    flex: 1;
    position: relative;
    overflow: hidden;
    //  给个小宽度示意一下，避免无前后缀时，此区域直接flex：1搞成0了
    min-width: 10px;

    >input {
      height: 32px;
      width: 100%;
    }

    //  控制器相关
    >.controls {
      user-select: none;
      position: absolute;
      background-color: #f5f7fa;
      width: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      >svg.snail-icon {
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

        &.plus {
          top: 1px;
          border-top-right-radius: 4px;
        }

        &.subtract {
          top: 50%;
          border-top: 1px solid #dddfed;
          border-bottom-right-radius: 4px;
        }
      }
    }

    //  输入框区域,有步长控制器时,input padding适配
    &.default>input {
      padding-left: 40px;
      padding-right: 40px;
    }

    &.right>input {
      padding-right: 40px;
    }
  }

  //  有前缀时，input输入框的适配样式
  &.has-prefix {
    >.input-panel>input {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  //  有后缀时，input输入框的适配样式
  &.has-suffix {
    >.input-panel>input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}

//  工具助手区域
.snail-number>.number-util {
  width: 100%;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 20px;
  color: #aaa;
}
</style>