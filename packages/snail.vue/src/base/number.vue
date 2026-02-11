<!-- 数值控件
    1、支持精度、前后缀、大写、千位符、步长控制等功能
    2、最大值、最小值功能，具体效果由外部自己控制，这里仅提示出来超过最大值、最小值、、、
      - 通过事件提示出来
    3、通过v-model双向绑定外部数值
  -->
<template>
  <div class="snail-number" :class="{ 'has-prefix': hasPrefix, 'has-suffix': hasSuffix }">
    <!-- 前缀、输入框、后缀区域 -->
    <div class="number-prefix placeholder" v-if="hasPrefix" v-text="prefix" />
    <div class="input-panel" :class="controlsMode">
      <input type="text" ref="input" :inputmode="precision > 0 ? 'decimal' : 'numeric'"
        :placeholder="readonly ? '' : placeholder" v-model="displayValueRef" @input="onInput" @blur="onBlur" />
      <!-- 步长控制按钮:不同样式,做不同按钮效果,采用不同模块实现 -->
      <template v-if="controlsMode == 'default'">
        <div class="controls default subtract">
          <Icon :type="'subtract'" :size="20" />
        </div>
        <div class="controls default plus">
          <Icon :type="'plus'" :size="20" />
        </div>
      </template>
      <template v-else-if="controlsMode == 'right'">
        <div class="controls right subtract">
          <Icon :type="'arrow'" :size="20" :rotate="270" />
        </div>
        <div class="controls right plus">
          <Icon :type="'arrow'" :size="20" :rotate="90" />
        </div>
      </template>
    </div>
    <div class="number-suffix placeholder" v-if="hasSuffix" v-text="suffix" />
    <!-- 数据的工具助手区域；强制换行：大写、千位符、、、 -->
    <div class="number-util placeholder">千分位</div>
    <div class="number-util placeholder">《》</div>
  </div>
</template>

<script setup lang="ts">
import { isStringNotEmpty } from "snail.core";
import { nextTick, ref, ShallowRef, shallowRef, useTemplateRef, } from "vue";
import { NumberEvents, NumberOptions } from "./models/number-model";
import { ChangeEvents } from "./models/base-event";
import Icon from "./icon.vue";
import { useReactive } from "./reactive";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<NumberOptions>();
const emits = defineEmits<NumberEvents>();
const valueModel = defineModel<number>();
const inputDom = useTemplateRef("input");
const { watcher } = useReactive();
//  2、组件交互变量、常量
/**   是否有数值前缀 */
const hasPrefix: boolean = isStringNotEmpty(_.prefix);
/**   是否有数值后缀 */
const hasSuffix: boolean = isStringNotEmpty(_.suffix);
/**   千分位模式 */
const thousandsMode = _.thousands || "disabled";
/**   步长控制模式 */
const controlsMode: NumberOptions["controls"] = _.readonly == true ? "disabled" : (_.controls || "disabled");
/**   步长值：强制整数，默认1 */
const stepValue: number = _.step > 1 ? parseInt(String(_.step)) : 1;
/**   精度值；强制整数，undefined时表示不处理精度 */
const precisionValue: number | undefined = _.precision >= 0 ? parseInt(String(_.precision)) : undefined;
//  3、文本框的数值渲染相关
/**    旧的数值，和latestNumber配合完成change事件判断*/
let oldNumber: number;
/*** 最新的数值 */
let latestNumber: number;
/**  数值的展示值：经过千分位的处理的值*/
const displayValueRef: ShallowRef<string> = shallowRef();
/** 忽略当前值变化 */
let ignoreCurValueChange: boolean = false;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 是否是有效的数值
 * - 自动去除千分位后、转换成数值
 * - 自动处理精度值
 * @param value 
 * @param dealPrecision 是否处理精度
 * @returns success 为true则是有效数字，number表示符合格式的数值；若输入仅 - 号时，succees为true，但number无值 
 */
function isValidNumber(value: string, dealPrecision: boolean): { success: boolean, number?: number } {
  if (isStringNotEmpty(value) == false) {
    return { success: false }
  }
  value = value.replace(/,/g, '');
  if (value.length == 0) {
    return { success: false }
  }
  //  判断是否是负数；若仅为 “-”，则返回succees，但是value不给值
  const isNegativeNumber = value.startsWith('-');
  isNegativeNumber && (value = value.substring(1));
  if (value.length == 0) {
    return { success: true, };
  }
  //  验证剩下的是否数值 数字.数字
  if (/^(?:[1-9]\d*|0)(?:\.\d*)?$/.test(value) == false) {
    return { success: false };
  }
  //    是否是以 . 结尾，此时说明还没有输入完成，不用转值
  if (value.endsWith('.') == true) {
    return { success: true };
  }
  //  处理小数位数
  let number: number;
  if (dealPrecision == true && precisionValue >= 0) {
    number = precisionValue == 0
      ? parseInt(value)
      : parseFloat(parseFloat(value).toFixed(precisionValue))
  }
  else {
    number = parseFloat(value);
  }
  isNegativeNumber && (number = -number);
  return { success: true, number: number };
}
/**
 * 格式化数值
 * - 处理千分符号、转大写值
 * @param number 
 */
function formatNumber(number: number): { thousandsText?: string, upperText?: string } | undefined {
  if (thousandsMode == "disabled") {
    return;
  }
  /**
   * 对数值进行千分位处理，先截取整数部分和小数部分，对整数部分转转千分符；然后再拼接小数部分
   *  对整数部分添加千分位（核心正则）；来自 https://metaso.cn/
   *    /\B(?=(\d{3})+(?!\d))/g
   *    1、\B 匹配非单词边界（确保不会在数字开头添加逗号）
   *    2、(?=(\d{3})+(?!\d)) 向前查找，确保后面紧跟着的是 3 的倍数个数字且后面不是数字
   */
  const [integerPart, decimalPart] = String(number).split(".");
  const thousandsText = decimalPart != undefined
    ? `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimalPart}`
    : integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return { thousandsText }
}

/**
 * 文本框输入时
 * @param evt 
 */
function onInput(evt: InputEvent) {
}
/**
 * 输入框失去焦点时
 * @param evt 
 */
function onBlur(evt: FocusEvent) {
  //  判定原始值是否改变，改变了则发送事件处理

  //  取值，进行小数位数处理，千分位处理
  console.log(evt)
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//    监听显示值的变化，将无效字符强制剔除掉
_.readonly || watcher(displayValueRef, (newValue, oldValue) => {
  if (ignoreCurValueChange == true) {
    ignoreCurValueChange = false;
    return;
  }
  //  空值时，清空所有
  if (isStringNotEmpty(newValue) == false) {
    latestNumber = undefined;
    return;
  }

  // 记录光标位置，进行数值有效性验证和格式化处理
  const inputSectionStart = inputDom.value.selectionStart;
  const result = isValidNumber(newValue, false);
  if (result.success == false) {
    ignoreCurValueChange = true;
    displayValueRef.value = oldValue;
    return;
  }
  //  进行千分位处理，实时刷新，并聚焦光标位置
  if (result.number != undefined) {
    latestNumber = result.number;

    const format = formatNumber(result.number);
    if (format && format.thousandsText != undefined) {
      if (format.thousandsText != displayValueRef.value) {
        ignoreCurValueChange = true;
        displayValueRef.value = format.thousandsText;
        inputSectionStart && nextTick(() => inputDom.value.setSelectionRange(inputSectionStart, inputSectionStart))
      }
    }
  }

});
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-number {
  width: 100%;
  min-height: 34px;
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

//  第一行：数值输入区域：文本输入框+步长控制器
.snail-number {
  >.input-panel {
    flex: 1;
    position: relative;
    overflow: hidden;

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
}
</style>