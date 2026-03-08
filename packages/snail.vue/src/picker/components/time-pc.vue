<!-- 时间选择器 PC端组件
    1、实现上，参照效果【zane-calendar】库效果
  -->
<template>
    <div class="snail-time-picker pc">
        <div class="time-header" v-text="'选择时间'" />
        <!-- 时间选择区域 -->
        <div class="time-zone">
            <!-- 时 -->
            <div class="tz-item">
                <div class="tzi-header">时</div>
                <div class="tzi-items" ref="hour-items">
                    <div class="tzi-number" v-for="(_, index) in Array(24).fill(undefined)"
                        :class="getTimeClass('hour', index)" v-text="String(index).padStart(2, '0')"
                        @click="onTimeClick('hour', index)" />
                </div>
            </div>
            <!--分 -->
            <div class="tz-item">
                <div class="tzi-header">分</div>
                <div class="tzi-items" ref="minute-items">
                    <div class="tzi-number" v-for="(_, index) in Array(60).fill(undefined)"
                        :class="getTimeClass('minute', index)" v-text="String(index).padStart(2, '0')"
                        @click="onTimeClick('minute', index)" />
                </div>
            </div>
            <!--秒 -->
            <div class="tz-item" v-if="secondDisabled != true">
                <div class="tzi-header">秒</div>
                <div class="tzi-items" ref="second-items">
                    <div class="tzi-number" v-for="(_, index) in Array(60).fill(undefined)"
                        :class="getTimeClass('second', index)" v-text="String(index).padStart(2, '0')"
                        @click="onTimeClick('second', index)" />
                </div>
            </div>
        </div>
        <!-- 操作区域 -->
        <div class="time-operation">
            <Button :type="'link'" :size="'small'" v-text="'清空'" @click="onClear" />
            <Button :type="'link'" :size="'small'" v-text="'现在'" @click="onNow" />
            <Button :type="'link'" :size="'small'" v-text="'确定'" @click="onConfirm" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, ShallowRef, shallowRef, useTemplateRef, nextTick, h, Ref } from "vue";
import { DatetimePickerEvents, TimePartValue, TimePickerOptions } from "../models/datetime-model";
import Button from "../../base/button.vue";
import { usePopup } from "../../popup/manager";
import { PopupHandle } from "../../popup/models/popup-model";
import { correctNullish, isNumberNotNaN, isStringNotEmpty } from "snail.core";
import { isTypeParameterDeclaration } from "typescript";
import { getHMSByString, getHMSNumber, isValidHour, isValidMinute, isValidSecond } from "../utils/datetime-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<TimePickerOptions & PopupHandle<string>>();
const { inPopup, closePopup } = props;
const emits = defineEmits<DatetimePickerEvents>();
const { toast } = usePopup();
//  2、组件交互变量、常量
/**     当前时间 */
const nowDateRef: ShallowRef<Date> = shallowRef();
/**     已选择的时间值 */
const timeRef: Ref<TimePartValue> = ref(getHMSByString(props.value));
/**     最小选择时间 */
const minTime = Object.freeze(getHMSByString(props.min));
/**     最大选择时间 */
const maxTime = Object.freeze(getHMSByString(props.max));
//  3、Dome元素相关引用
/**     小时选择外层scroll */
const hItemsDom = useTemplateRef("hour-items");
/**     分钟选择外层scroll */
const mItemsDom = useTemplateRef("minute-items");
/**     秒钟选择外层scroll */
const sItemsDom = useTemplateRef("second-items");

// *****************************************   👉  方法+事件    ****************************************
/**
 * 显示错误信息
 * @param message 
 */
function showError(message: string) {
    toast("error", message, { duration: 1000 });
}
/**
 * 获取时间的自定义样式
 * @param type 类型：时分秒
 * @param value 具体的时间值
 * @returns 自定义类样式记录，key为类样式名称，value为是否生效
 */
function getTimeClass(type: "hour" | "minute" | "second", value: number): Record<string, boolean> {
    switch (type) {
        case "hour":
            return {
                now: nowDateRef.value.getHours() == value,
                active: timeRef.value.hour == value,
                disabled: isValidHour(value, minTime, maxTime) == false
            }
        case "minute":
            return {
                now: nowDateRef.value.getMinutes() == value,
                active: timeRef.value.minute == value,
                disabled: isValidMinute(timeRef.value.hour, value, minTime, maxTime) == false
            };
        case "second":
            return {
                now: nowDateRef.value.getSeconds() == value,
                active: timeRef.value.second == value,
                disabled: isValidSecond(timeRef.value.hour, timeRef.value.minute, value, minTime, maxTime) == false
            }
    }
}
/**
 * 选举合理时间项显示出来，避免始终从 00 区域显示
 * @param items 
 */
function scrollIntoView(items: HTMLElement) {
    //  遍历计算出 当前选中项、第一个和最后一个有效数据，当前时间对应的数据多因
    let activeIndex: number = undefined, firstInvalidIndex: number, lastInvalidIndex: number, nowIndex: number;
    for (var index = 0; index < (items ? items.children.length : 0); index++) {
        const ele = items.children[index] as HTMLElement;
        if (ele.classList.contains("active") == true) {
            activeIndex = index;
            break;
        }
        if (nowIndex == undefined && ele.classList.contains("now") == true) {
            nowIndex = index;
        }
        if (ele.classList.contains("disabled") == false) {
            firstInvalidIndex == undefined && (firstInvalidIndex = index);
            lastInvalidIndex = index;
        }
    }
    //  选举出合理的显示区域出来：这里需要再优化一下
    let showIndex = activeIndex;
    if (activeIndex == undefined) {
        if (firstInvalidIndex != undefined) {
            showIndex = parseInt(String((firstInvalidIndex + lastInvalidIndex) / 2));
            // showIndex = firstInvalidIndex;
        }
        showIndex == undefined && (showIndex = nowIndex);
    }
    showIndex != undefined && items.children[showIndex].scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * 点击时间选择时
 * @param type 类型，时分秒
 * @param value 具体时选择值 
 */
async function onTimeClick(type: "hour" | "minute" | "second", value: number) {
    switch (type) {
        case "hour":
            if (isValidHour(value, minTime, maxTime)) {
                timeRef.value.hour = value;
                await nextTick();
                scrollIntoView(mItemsDom.value);
            }
            break;
        case "minute":
            if (isValidMinute(timeRef.value.hour, value, minTime, maxTime)) {
                timeRef.value.minute = value
                await nextTick();
                scrollIntoView(sItemsDom.value);
            }
            break;
        case "second":
            if (isValidSecond(timeRef.value.hour, timeRef.value.minute, value, minTime, maxTime)) {
                timeRef.value.second = value;
            }
            break;
    }
}

/**
 * 清空 按钮点击
 */
function onClear() {
    emits("clear");
    inPopup && closePopup("");
}
/**
 * 现在 按钮点击
 */
async function onNow() {
    // 获取当前时间,做选中处理
    nowDateRef.value = new Date();
    //  存在空值时，以当前时间初始化
    isNumberNotNaN(timeRef.value.hour) || (timeRef.value.hour = nowDateRef.value.getHours());
    isNumberNotNaN(timeRef.value) || (timeRef.value.minute = nowDateRef.value.getMinutes());
    isNumberNotNaN(timeRef.value) || (timeRef.value.second = nowDateRef.value.getSeconds());
    //  判断已有值是否有效，无效置null
    isValidHour(timeRef.value.hour, minTime, maxTime) || (timeRef.value.hour = undefined);
    isValidMinute(timeRef.value.hour, timeRef.value.minute, minTime, maxTime) || (timeRef.value.minute = undefined);
    isValidSecond(timeRef.value.hour, timeRef.value.minute, timeRef.value.second, minTime, maxTime) || (timeRef.value.second = undefined);
    //  等待视图更新后，滚动合适数据过来
    await nextTick();
    scrollIntoView(hItemsDom.value);
    scrollIntoView(mItemsDom.value);
    scrollIntoView(sItemsDom.value);
}
/**
 * 确定 按钮点击
 */
function onConfirm() {
    //  组装值返回
    if (timeRef.value == undefined || timeRef.value.hour == undefined) {
        return showError("请选选择时间");
    }
    if (props.secondDisabled != true && timeRef.value.minute == undefined) {
        return showError("请选选择时间");
    }
    //  组装值
    const valueItems: string[] = [
        String(timeRef.value.hour).padStart(2, "0"),
        String(timeRef.value.minute).padStart(2, "0")
    ]
    props.secondDisabled || valueItems.push(String(timeRef.value.second).padStart(2, "0"))
    const value = valueItems.join(":");
    // 提交选择
    emits("confirm", value);
    inPopup && closePopup(value);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
//      挂载完成后，找到所有激活的item，显示出来
onMounted(onNow);
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-time-picker.pc {
    background-color: #fff;
    box-shadow: 0 0px 3px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.12);
    width: 280px;
    height: 300px;
    overflow: hidden !important;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    >.time-header {
        height: 40px;
        flex-shrink: 0;
        line-height: 40px;
        font-size: 16px;
        text-align: center;
    }

    //  时间选择区域
    >.time-zone {
        flex: 1;
        border-top: solid 1px #eee;
        border-bottom: solid 1px #eee;
        display: flex;
        overflow: hidden;
        flex-wrap: nowrap;
        justify-content: space-around;
        padding: 0 5px 10px 5px;

        >.tz-item {
            flex: 1;
            margin-left: 8px;
            margin-right: 8px;
            overflow: hidden;
            //  flex布局，列 为主轴：display: flex，flex-direction: column;
            .flex-column();


            >.tzi-header {
                flex-shrink: 0;
                height: 25px;
                line-height: 25px;
                text-align: center;
            }

            >.tzi-items {
                border: solid 1px #eee;
                flex: 1;
                overflow-x: hidden;
                overflow-y: auto;

                >.tzi-number {
                    height: 25px;
                    line-height: 25px;
                    text-align: center;
                    cursor: pointer;

                    &:hover {
                        background-color: #f4f4f4;
                    }

                    &.active {
                        background-color: #46d7a2 !important;
                        color: white;
                    }

                    &.disabled {
                        cursor: not-allowed;
                        color: #ddd !important;
                        background-color: initial !important;
                    }
                }

                //  滚动条样式自定义
                &::-webkit-scrollbar {
                    width: 4px;
                }

                &::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.6);
                    border: none;
                    border-radius: 0;
                }

                &::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 0;
                }

            }
        }
    }

    //  操作区域
    >.time-operation {
        height: 40px;
        flex-shrink: 0;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-right: 10px;

        >.snail-button {
            margin-left: 16px;
            font-size: 13px;
            color: #999;

            &:hover {
                color: #46d7a2;
            }
        }
    }
}
</style>