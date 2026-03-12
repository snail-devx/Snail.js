<!-- 日期选择器 PC端组件
    1、外部使用 follow弹窗打开
    2、内部集成 time-pc.vue时间选择
  -->
<template>
  <Layout class="date-picker pc" :mode="'vertical'" :top="{ height: '40px' }" :bottom="{ height: '30px' }">
    <!-- 顶部导航区域：展示左右切换等功能 -->
    <template #top>
      <Icon :type="'arrow'" :rotate="180" :size="26" @click="onPreNextClick(true)" />
      <div class="header-content" :class="stepRef">
        <template v-if="stepRef == 'year'">
          <div v-text="`${yearItems[0]}年 - ${getFromArray(yearItems, -1)}年`" />
        </template>
        <template v-else>
          <div v-text="`${dateRef.year}年`" @click="onSwitchStepClick('year')" />
          <div v-text="`${dateRef.month}月`" v-if="stepRef == 'day'" @click="onSwitchStepClick('month')" />
        </template>
      </div>
      <Icon :type="'arrow'" :size="26" @click="onPreNextClick(false)" />
    </template>
    <!-- 年月日选择-->
    <template #main>
      <!-- 选择年份 -->
      <template v-if="stepRef == 'year'">
        <div class="year-item" v-for="item in yearItems" :key="item">
          <span v-text="item" :class="buildYearItemClass(item)" @click="onYearItemClick(item)" />
        </div>
      </template>
      <!-- 选择月份 -->
      <template v-else-if="stepRef == 'month'">
        <div class="month-item" v-for="item in buildMonthItems()" :key="item.text">
          <span v-text="item.text" :class="buildMonthItemClass(item.value)" @click="onMonthItemClick(item.value)" />
        </div>
      </template>
      <!-- 选择天 -->
      <template v-else>
        <div class="day-item week" v-for="item in weekItems" :key="item" v-text="item" />
        <div class="day-item" v-for="item in dayItemsRef" :key="`${item.year}-${item.month}-${item.day}`">
          <span v-text="item.day" :class="buildDayItemClass(item)" @click="onDayItemClick(item)" />
        </div>
      </template>
    </template>
    <!-- 操作区域 -->
    <template #bottom v-if="stepRef == 'day'">
      <Button :type="'link'" :size="'small'" v-text="'清空'" @click="emits('clear'), inPopup && closePopup('')" />
      <Button :type="'link'" :size="'small'" v-text="'现在'" @click="onNow" />
      <Button :type="'link'" :size="'small'" v-text="'确定'" @click="onConfirm" /></template>
  </Layout>
</template>

<script setup lang="ts">
import { computed, Ref, ref, ShallowRef, shallowRef, } from "vue";
import { DatePickerDayItem, DatePickerOptions, DatetimePickerEvents } from "../models/datetime-model";
import Layout from "../../container/layout.vue";
import Icon from "../../base/icon.vue";
import Button from "../../base/button.vue";
import Transitions from "../../container/transitions.vue";
import { DateFormat, DateValue, getDateValue, getFromArray, newId, TimeValue } from "snail.core";
import { buildDayItems, buildMonthItems, buildYearItems } from "../utils/datetime-util";
import { FollowExtend, FollowHandle } from "../../popup/models/follow-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<DatePickerOptions & FollowExtend & FollowHandle<string>>();
const emits = defineEmits<DatetimePickerEvents>();
const { inPopup } = props;
/**   校验出来的格式 */
const format = (() => {
  switch (props.format) {
    case "yyyy":
    case "yyyy-MM":
    case "yyyy-MM-dd HH:mm":
    case "yyyy-MM-dd HH:mm:ss":
      return props.format;
    default: return "yyyy-MM-dd";
  }
})();
//  2、存储选择值
/**   选择的日期值：年月日时分秒*/
const dateRef: Ref<DateValue> = ref();
//  3、组件交互变量、常量
/**   步骤值：year（选择年）、month（选择月）、day（选择日） */
const stepRef: ShallowRef<"year" | "month" | "day"> = shallowRef();
/**   年分选择项集合*/
const yearItems: ShallowRef<number[]> = shallowRef();
/**   天的选择项集合 */
const dayItemsRef: ShallowRef<DatePickerDayItem[]> = shallowRef([]);
/**   星期几的展示项目 */
const weekItems = Object.freeze(["日", "一", "二", "三", "四", "五", "六"]);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建【年份】选择项的类样式
 * @param year 年份
 * @returns 类样式记录，key为类样式名称，value为是否生效
 */
function buildYearItemClass(year: number): Record<string, boolean> {
  //  是否在最大值最小值区间
  return {
    "active": dateRef.value.year == year,
    // "disabled":
  }
}
/**
 * 构建【月份】选择项的类样式
 * @param year 月份
 * @returns 类样式记录，key为类样式名称，value为是否生效
 */
function buildMonthItemClass(month: number): Record<string, boolean> {
  //  是否在最大值最小值区间，需要和年份对上
  return {
    "active": dateRef.value.month == month,
    // "disabled":
  }
}
/**
 * 构建【天树】选择项的类样式
 * @param item 天数
 * @returns 类样式记录，key为类样式名称，value为是否生效
 */
function buildDayItemClass(item: DatePickerDayItem): Record<string, boolean> {
  //  是否在最大值最小值区间，需要和年份对上
  return {
    "active": dateRef.value.year == item.year && dateRef.value.month == item.month && dateRef.value.day == item.day,
    // "disabled":
    "now-month": dateRef.value.year == item.year && dateRef.value.month == item.month,
  }
}

/**
 * 上一个、下一个按钮点击时
 * @param isPre 是上一个点击吗
 */
function onPreNextClick(isPre: boolean) {
  const basis = (isPre ? -1 : 1);
  switch (stepRef.value) {
    //  选择年份：每次切换18个年份
    case "year": {
      dateRef.value.year += basis * 18;
      yearItems.value = buildYearItems(dateRef.value.year);
      break;
    }
    //  选择月份时：每年切换
    case "month": {
      dateRef.value.year += basis;
      break;
    }
    //  选择天数：每次切换一个月
    case "day": {
      const date = new Date(dateRef.value.year, dateRef.value.month - 1, 1);
      date.setMonth(date.getMonth() + basis);
      dateRef.value.year = date.getFullYear();
      dateRef.value.month = date.getMonth() + 1;
      dayItemsRef.value = buildDayItems(dateRef.value.year, dateRef.value.month);
      break;
    }
  }
  dateRef.value.day = 1;
}
/**
 * 切换选择步骤时
 * @param newValue 新的步骤
 */
function onSwitchStepClick(newValue: typeof stepRef.value) {
  /** 延迟设置，避免click中直接更改，导致冒泡时判断触发事件元素从属出问题 */
  setTimeout(() => stepRef.value = newValue);
}

/**
 * 点击选择了 年 时
 * @param year 
 */
function onYearItemClick(year: number) {
  //  是否是在有效范围，不在则不能响应
  //  在则触发响应
  dateRef.value.year = year;
  if (format == "yyyy") {
    const value = String(year).padStart(4, "0");
    emits("confirm", value);
    props.inPopup && props.closePopup(value);
  }
  else {
    dateRef.value.month = 1;
    onSwitchStepClick("month");
  }
}
/**
 * 点击选择了 月 时
 * @param month 
 */
function onMonthItemClick(month: number) {
  //  是否是在有效范围，不在则不能响应
  //  在则触发响应
  dateRef.value.month = month;
  if (format == "yyyy-MM") {
    const value = [
      String(dateRef.value.year).padStart(4, "0"),
      String(month).padStart(2, "0")
    ].join("-");
    emits("confirm", value);
    props.inPopup && props.closePopup(value);
  }
  else {
    dateRef.value.day = 1;
    dayItemsRef.value = buildDayItems(dateRef.value.year, dateRef.value.month);
    onSwitchStepClick("day");
  }
}
/**
 * 点击选择了 日 时
 * @param item 
 */
function onDayItemClick(item: DatePickerDayItem) {
  //  验证是否可选，不可选不响应；可能选择的是上一个月和下一个月的数据
  dateRef.value.year = item.year;
  dateRef.value.month = item.month;
  dateRef.value.day = item.day;
  if (format == "yyyy-MM-dd") {
    const value = [
      String(dateRef.value.year).padStart(4, "0"),
      String(dateRef.value.month).padStart(2, "0"),
      String(dateRef.value.day).padStart(2, "0")
    ].join("-");
    emits("confirm", value);
    props.inPopup && props.closePopup(value);
  }
  else {
    //  刷新时间选择、、
  }
}

/**
 * 【现在】按钮点击时
 */
function onNow() {

}
/**
 * 【确认】按钮点击时
 */
function onConfirm() {

}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
{
  //  初始化第一屏展示的选择步骤
  switch (format) {
    case "yyyy":
      stepRef.value = "year";
      break;
    case "yyyy-MM":
      stepRef.value = "month";
      break;
    default:
      stepRef.value = "day";
      break;
  }
  //  初始化已选值
  dateRef.value == undefined && (dateRef.value = getDateValue(new Date()));
  yearItems.value = buildYearItems(dateRef.value.year);
  dayItemsRef.value = buildDayItems(dateRef.value.year, dateRef.value.month);
}
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-layout.date-picker.pc {
  width: 280px;
  height: 300px;
  background-color: #fff;
  box-shadow: 0 0px 3px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden !important;
  user-select: none;

  >.top-area {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    border-bottom: solid 1px #eee;
    padding: 0 4px;

    >svg {
      flex-shrink: 0;
      fill: #8a9099;

      &:hover {
        fill: #0f7eef;
      }
    }

    >div.header-content {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      >div {
        height: 100%;
        font-size: 16px;
        display: flex;
        align-items: center;

        &:nth-child(2) {
          margin-left: 8px;
        }
      }

      //  除开年份选择，其他情况都是可点击，给点击样式
      &:not(.year)>div:hover {
        cursor: pointer;
        color: #0f7eef;
      }
    }
  }

  >.main-area {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    >div {
      flex-shrink: 0;
      position: relative;
      font-size: 13px;
      cursor: pointer;
      //  flex 布局：display: flex，align-items、justify-content 都为center
      .flex-center();

      >span {
        height: 28px;
        //  flex 布局：display: flex，align-items、justify-content 都为center
        .flex-center();

        &:hover {
          background: #f4f4f4;
        }

        &.active {
          background-color: #58a4fd;
          color: white;
        }

        &.disabled {
          cursor: not-allowed !important;
        }
      }
    }

    //  选择day
    >div.day-item {
      width: 36px;

      &.week {
        font-weight: bold;
      }

      >span.active,
      >span:hover {
        width: 28px;
        border-radius: 100%;
      }

      >span:not(.now-month) {
        color: #aaa;
      }
    }

    //  选择year和month
    >div.month-item,
    >div.year-item {
      width: 30%;

      >span.active,
      >span:hover {
        width: fit-content;
        padding: 0 8px;
        border-radius: 15px;
      }
    }
  }

  //  操作区域
  >.bottom-area {
    height: 30px;
    padding-right: 10px;
    border-top: solid 1px #eee;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    >.snail-button {
      margin-left: 4px;
      font-size: 12px;
      color: #999;
      // color: #58a4fd;

      &:last-child,
      &:hover {
        color: #0f7eef;
      }
    }
  }
}
</style>