<!-- 时间选择器 PC端组件
    1、实现上，参照效果【zane-calendar】库效果
  -->
<template>
    <Layout class="snail-time-picker pc" :class="{ 'second-disabled': secondDisabled }" :mode="'vertical'">
        <Transitions :group="true" :effect="'down-up'">
            <!-- 时分秒选择区域-->
            <template #default>
                <div class="tz-item" ref="hour-items">
                    <div class="tzi-number" v-for="(_, index) in Array(24).fill(undefined)"
                        :class="getTimeClass('hour', index)" v-text="String(index).padStart(2, '0')"
                        @click="onTimeClick('hour', index)" />
                </div>
                <div class="tz-item" ref="minute-items">
                    <div class="tzi-number" v-for="(_, index) in Array(60).fill(undefined)"
                        :class="getTimeClass('minute', index)" v-text="String(index).padStart(2, '0')"
                        @click="onTimeClick('minute', index)" />
                </div>
                <div class="tz-item" ref="second-items" v-if="secondDisabled != true">
                    <div class="tzi-number" v-for="(_, index) in Array(60).fill(undefined)"
                        :class="getTimeClass('second', index)" v-text="String(index).padStart(2, '0')"
                        @click="onTimeClick('second', index)" />
                </div>
            </template>
            <!-- 操作区域 -->
            <template #bottom>
                <Button :type="'link'" :size="'small'" v-text="'清空'"
                    @click="emits('clear'), inPopup && closePopup('')" />
                <Button :type="'link'" :size="'small'" v-text="'现在'" v-if="tm.validate(getTimeNow())" @click="onNow" />
                <Button :type="'link'" :size="'small'" v-text="'确定'" @click="onConfirm" />
            </template>
        </Transitions>
    </Layout>
</template>

<script setup lang="ts">
import { isNumberNotNaN, newId, useTime, TimeValue, parseTime, ITimeValueManager, getTimeNow } from "snail.core";
import { onMounted, ref, ShallowRef, shallowRef, useTemplateRef, nextTick, Ref } from "vue";
import { FollowExtend, FollowHandle, usePopup } from "../../popup/manager";
import { DatetimePickerEvents, TimePickerOptions } from "../models/datetime-model";
import Button from "../../base/button.vue";
import Transitions from "../../container/transitions.vue";
import Layout from "../../container/layout.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<TimePickerOptions & FollowHandle<string> & FollowExtend>();
const emits = defineEmits<DatetimePickerEvents>();
const tm = props.manager || useTime({
    format: props.format == "HH:mm" ? "HH:mm" : "HH:mm:ss",
    min: parseTime(props.min),
    max: parseTime(props.max)
});
const { toast } = usePopup();
//  2、组件交互变量、常量
const { inPopup, closePopup } = props;
/**     是否禁用了秒选择 */
const secondDisabled: boolean = tm.format == "HH:mm";
/**     已选择的时间值 */
const tvRef: Ref<TimeValue> = ref();
//  3、Dome元素相关引用
/**     小时选择外层scroll */
const hItemsDom = useTemplateRef("hour-items");
/**     分钟选择外层scroll */
const mItemsDom = useTemplateRef("minute-items");
/**     秒钟选择外层scroll */
const sItemsDom = useTemplateRef("second-items");

// *****************************************   👉  方法+事件    ****************************************
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
                active: tvRef.value.hour == value,
                disabled: tm.validateHH(value) == false
            }
        case "minute":
            return {
                active: tvRef.value.minute == value,
                disabled: tm.validateHHmm(tvRef.value.hour, value) == false
            };
        case "second":
            return {
                active: tvRef.value.second == value,
                disabled: tm.validateHHmmss(tvRef.value.hour, tvRef.value.minute, value) == false
            }
    }
}
/**
 * 选举合理时间项显示出来，避免始终从 00 区域显示
 * @param items 
 */
function scrollIntoView(items: HTMLElement) {
    //  遍历计算出 当前选中项、第一个和最后一个有效数据，当前时间对应的数据多因
    let activeIndex: number = undefined, firstValidIndex: number;
    for (var index = 0; index < (items ? items.children.length : 0); index++) {
        const ele = items.children[index] as HTMLElement;
        if (ele.classList.contains("disabled") == true) {
            continue;
        }
        if (firstValidIndex == undefined) {
            firstValidIndex = index;
        }
        if (ele.classList.contains("active") == true) {
            activeIndex = index;
            break;
        }
    }
    //  选举出合理的显示区域出来：优先显示出已选值，无则显示出第一个有效的选项数据出来
    let showIndex = activeIndex;
    if (activeIndex == undefined) {
        if (firstValidIndex != undefined) {
            showIndex = firstValidIndex;
        }
    }
    //  这个后期做一下优化，选择时间后，可能会触发分钟、秒选项的滚动
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
            if (tm.validateHH(value)) {
                tvRef.value.hour = value;
                await nextTick();
                scrollIntoView(mItemsDom.value);
            }
            break;
        case "minute":
            if (tm.validateHHmm(tvRef.value.hour, value)) {
                tvRef.value.minute = value
                await nextTick();
                scrollIntoView(sItemsDom.value);
            }
            break;
        case "second":
            if (tm.validateHHmmss(tvRef.value.hour, tvRef.value.minute, value)) {
                tvRef.value.second = value;
            }
            break;
    }
}

/**
 * 现在 按钮点击
 */
async function onNow() {
    // 获取当前时间,做选中处理
    tvRef.value = getTimeNow();
    //  现在的值有效时，进行滚动处理
    if (tm.validate(tvRef.value)) {
        await nextTick();
        scrollIntoView(hItemsDom.value);
        scrollIntoView(mItemsDom.value);
        scrollIntoView(sItemsDom.value);
    }
}
/**
 * 确定 按钮点击
 */
function onConfirm() {
    //  验证处理，先校正一下，避免出问题；未禁用【秒】时的特殊处理
    tvRef.value = tm.correct(tvRef.value) || Object.create(null);
    if (tvRef.value == undefined || tvRef.value.hour == undefined) {
        return toast("error", "请选选择时间");
    }
    if (secondDisabled != true && tvRef.value.minute == undefined) {
        return toast("error", "请选选择时间");
    }
    //  组装值；提交选择
    const value: string = tm.toString(tvRef.value);
    emits("confirm", value);
    inPopup && closePopup(value);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
{
    //  初始化已选值；确保值非undefined
    props.value && (tvRef.value = tm.parse(props.value));
    tvRef.value || props.initialDisabled || (tvRef.value = tm.correct(getTimeNow()));
    tvRef.value || (tvRef.value = Object.create(null));
}
//  2、生命周期响应
//      挂载完成后，找到所有激活的item，显示出来
onMounted(async () => {
    await nextTick();
    scrollIntoView(hItemsDom.value);
    scrollIntoView(mItemsDom.value);
    scrollIntoView(sItemsDom.value);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-time-picker.pc {
    width: 210px;
    height: 240px;
    background-color: #fff;
    box-shadow: 0 0px 3px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    overflow: hidden !important;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

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
                    background-color: #58a4fd !important;
                    border-color: #58a4fd;
                    color: white;
                }

                &.disabled {
                    cursor: not-allowed;
                    border-color: #eee;
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

// *****************************************   👉  特定样式适配    *****************************************
//  禁用秒选择
.snail-time-picker.pc.second-disabled {
    width: 180px;

    >.main-area {
        >.tz-item {
            width: 46%;
        }
    }
}
</style>