<!-- 时间选择器 PC端组件
    1、实现上，参照效果【zane-calendar】库效果
  -->
<template>
    <Layout class="time-picker pc" :class="{ 'second-disabled': format != 'HH:mm:ss' }" :mode="'vertical'">
        <!-- 时分秒选择区域-->
        <template #main>
            <Transitions :group="true" :effect="'down-up'">
                <div class="tz-item" ref="hour-items">
                    <div class="tzi-number" v-for="item in hourItems" :key="item.hour"
                        :class="{ active: item.hour == timeRef.hour, disabled: item.disabled }"
                        v-text="padStart(item.hour, 2, '0')" @click="onHourClick(item)" />
                </div>
                <div class="tz-item" ref="minute-items">
                    <div class="tzi-number" v-for="item in minuteItems" :key="`${item.hour}:${item.minute}`"
                        :class="{ active: item.minute == timeRef.minute, disabled: item.disabled }"
                        v-text="padStart(item.minute, 2, '0')" @click="onMinuteClick(item)" />
                </div>
                <div class="tz-item" ref="second-items" v-if="format == 'HH:mm:ss'">
                    <div class="tzi-number" v-for="item in secondItems"
                        :key="`${item.hour}:${item.minute}:${item.second}`"
                        :class="{ active: item.second == timeRef.second, disabled: item.disabled }"
                        v-text="padStart(item.second, 2, '0')" @click="onSecondClick(item)" />
                </div>
            </Transitions>
        </template>
        <!-- 操作区域 -->
        <template #bottom v-if="toolbarDisabled != true">
            <Button :type="'link'" :size="'small'" v-if="clearDisabled != true" v-text="'清空'"
                @click="emits('clear'), inPopup && closePopup('')" />
            <Button :type="'link'" :size="'small'" v-if="nowDisabled != true" v-text="'现在'"
                @click="rebuildItems(getTimeValue(new Date()))" />
            <Button :type="'link'" :size="'small'" v-text="'确定'" :class="{ disabled: isValidTimeRef != true }"
                @click="onConfirm" />
        </template>
    </Layout>
</template>

<script setup lang="ts">
import { isNumberNotNaN, newId, useTimeValue, TimeValue, parseTimeValue, ITimeValueManager, getTimeValue, padStart, TimeFormat, formatTimeValue } from "snail.core";
import { onMounted, ref, ShallowRef, shallowRef, useTemplateRef, nextTick, Ref, computed } from "vue";
import { FollowExtend, FollowHandle, usePopup } from "../../popup/manager";
import { DatetimePickerEvents, TimePickerHourItem, TimePickerMinuteItem, TimePickerOptions, TimePickerSecondItem } from "../models/datetime-model";
import Button from "../../base/button.vue";
import Transitions from "../../container/transitions.vue";
import Layout from "../../container/layout.vue";
import { PickerExtend } from "../models/picker-model";
import { buildHourItems, buildMinuteItems, buildSecondItems } from "../utils/datetime-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<TimePickerOptions & PickerExtend & FollowHandle<string> & FollowExtend>();
const emits = defineEmits<DatetimePickerEvents>();
/**     时间格式 */
const format = props.format == "HH:mm" ? "HH:mm" : "HH:mm:ss";
/**     时间最小值 */
const min = parseTimeValue(props.min);
/**     时间最大值 */
const max = parseTimeValue(props.max);
//  2、组件交互变量、常量
/**     已选择的时间值 */
const timeRef: Ref<TimeValue> = ref(parseTimeValue(props.value) || getTimeValue(new Date()));
/**     是否是有效的时间值 */
const isValidTimeRef = computed(() => format == "HH:mm"
    ? minuteItems.value && minuteItems.value[timeRef.value.minute].disabled != true
    : secondItems.value && secondItems.value[timeRef.value.second].disabled != true
);
/**     小时 选择项集合*/
const hourItems: ShallowRef<TimePickerHourItem[]> = shallowRef(buildHourItems(min, max));
/**     分钟选择项集合*/
const minuteItems: ShallowRef<TimePickerMinuteItem[]> = shallowRef();
/**     秒钟选择项集合*/
const secondItems: ShallowRef<TimePickerSecondItem[]> = shallowRef();
//  3、Dome元素相关引用
/**     小时选择外层scroll */
const hItemsDom = useTemplateRef("hour-items");
/**     分钟选择外层scroll */
const mItemsDom = useTemplateRef("minute-items");
/**     秒钟选择外层scroll */
const sItemsDom = useTemplateRef("second-items");

// *****************************************   👉  方法+事件    ****************************************
/**
 * 重新构建时间选择项
 * @param time 新的时间值，非undefined时，更新给 timeRef 
 */
async function rebuildItems(time: TimeValue | undefined) {
    // // 获取当前时间,做选中处理
    time != undefined && (timeRef.value = time);
    minuteItems.value = buildMinuteItems(hourItems.value[timeRef.value.hour], min, max);
    secondItems.value = buildSecondItems(minuteItems.value[timeRef.value.minute], min, max);
    //  现在的值有效时，进行滚动处理
    await nextTick();
    scrollIntoView(hItemsDom.value);
    scrollIntoView(mItemsDom.value);
    scrollIntoView(sItemsDom.value);
}

/**
 * 选举合理时间项显示出来，避免始终从 00 区域显示
 * @param items 
 */
function scrollIntoView(items: HTMLElement) {
    /** 遍历选举出合适的选项滚动到可见据
     *  1、现在先始终使用 选中值，后期做一些优化，如选中值无效时，将靠近它的可选值滚动出来，在上则滚动到底部；再下面则滚动到顶部
     */
    let activeIndex: number = undefined;
    for (var index = 0; index < (items ? items.children.length : 0); index++) {
        const ele = items.children[index] as HTMLElement;
        if (ele.classList.contains("active") == true) {
            activeIndex = index;
            break;
        }
    }
    activeIndex != undefined && items.children[activeIndex].scrollIntoView({ behavior: "smooth", block: "center" });
}
/**
 * 小时点击时
 * @param item 
 */
function onHourClick(item: TimePickerHourItem) {
    /** 非禁用，且有改变时，基于小时构建分钟*/
    if (item.disabled == true || timeRef.value.hour == item.hour) {
        return;
    }
    timeRef.value.hour = item.hour;
    minuteItems.value = buildMinuteItems(item, min, max);
    secondItems.value = buildSecondItems(minuteItems.value[timeRef.value.minute], min, max);
}
/**
 * 分钟点击时
 * @param item 
 */
function onMinuteClick(item: TimePickerMinuteItem) {
    if (item.disabled != true) {
        if (format == "HH:mm") {
            const value = formatTimeValue(item, "HH:mm");
            emits("confirm", value);
            props.inPopup && props.closePopup(value);
        }
        else {
            timeRef.value.minute = item.minute;
            secondItems.value = buildSecondItems(item, min, max);
        }
    }
}
/**
 * 秒钟点击时
 * @param item 
 */
function onSecondClick(item: TimePickerSecondItem) {
    if (item.disabled != true) {
        timeRef.value.second = item.second;
        onConfirm();
    }
}

/**
 * 点击【确认】按钮时
 */
function onConfirm() {
    if (isValidTimeRef.value == true) {
        const value = formatTimeValue(timeRef.value, format);
        emits("confirm", value);
        props.inPopup && props.closePopup(value);
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(rebuildItems);
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-layout.time-picker.pc {
    width: 210px;
    height: 240px;
    background-color: #fff;
    box-shadow: 0 0px 3px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    overflow: hidden !important;
    user-select: none;

    //  时分秒选择区域
    >.main-area {
        overflow: hidden;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        margin: 10px;

        >.tz-item {
            flex-shrink: 0;
            width: 30%;
            overflow: hidden auto;
            border: solid 1px #eee;
            border-left: none;

            >.tzi-number {
                height: 24px;
                cursor: pointer;
                border-left: solid 1px #eee;
                //  flex 布局：display: flex，align-items、justify-content 都为center
                .flex-center();

                &:hover {
                    background-color: #f4f4f4;
                }

                &.active {
                    background-color: #58a4fd;
                    border-color: #58a4fd;
                    color: white !important;

                    &.disabled {
                        opacity: 0.6;
                    }
                }

                &.disabled {
                    cursor: not-allowed;
                    color: #ddd;
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
                color: #58a4fd;
            }

            &.disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }
        }
    }
}

// *****************************************   👉  特定样式适配    *****************************************
//  禁用秒选择
.snail-layout.time-picker.pc.second-disabled {
    width: 180px;

    >.main-area {
        >.tz-item {
            width: 46%;
        }
    }
}
</style>