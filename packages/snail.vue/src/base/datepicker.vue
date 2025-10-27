<!-- 日期选择器组件 
    1、只提供盖板模式，即组件绝对定位填充满父级元素，并透明；点击时显示日期选择弹窗，外部自己决定如何渲染已选日期
        1、若需要input等模式时,在form中封装Datetime组件
    2、日期选择弹窗，利用【zane-calendar】库实现，此库为原生日期选择插件，不依赖其他组件库
        1、一开始初始化插件，然后绑定到目标元素做触发
        2、目标元素点击激活时，自动构建日期选择弹窗
    3、zane-calendar 的弹窗基本原理
        1、初始化弹窗时，基于目标元素id转换生成window对象上的 zane-calendar 实例；详细为 calendarName 属性值
        2、zane-calendar 实例包含了以下关键属性：
            1、$obj 为弹窗时生成的弹窗元素dom对象；
            2、removeCalendar 方法，可直接关闭弹窗
        3、若为range，则会生成两个 zane-calendar 实例，一个为 calendarName；第二个为 ${calendarName}DOUBLE
-->
<template>
    <div class="snail-datepicker" :id="id" @click="onClick" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, useId, } from "vue";
import { DatePickerEvents, DatepickerOptions } from "./models/date-model";
import { getFromArray, IScope, isFunction, newId, script, throwError, useTimer } from "snail.core";
import { link } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<DatepickerOptions>();
const emits = defineEmits<DatePickerEvents>();
const { onInterval, onTimeout } = useTimer();
const { range } = props;
//  2、日期选择器弹窗 初始化管理
/**      日期格式 */
const format: string = props.format || "yyyy-MM-dd";
/**     组件唯一Id值 */
const id: string = `DP${newId()}`.toUpperCase();
/**     弹窗初始化的定时器 */
var pickerInitialTimer: IScope = undefined;
//  3、日期选择器弹窗状态管理
/**     弹窗最新状态 */
var pickerLastStatus: "focus" | "blur" = undefined;
/**     弹窗状态定时器 */
var pickerStatusTimer: IScope = undefined;
/**     弹窗状态数组：暂存，解决range模式下时，focus和blur来回触发的问题*/
const pickerStatusArray: Array<typeof pickerLastStatus> = [];
//  4、对外暴露接口
defineExpose({ showPicker });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 初始化日期选择弹窗
 * @param flag 弹窗标识
 * @returns 初始化成功返回true，否则false
 */
function initZanePopup(flag: string): boolean {
    // 监听事件：避免重复监听，先移除再监听
    const obj: HTMLElement = window[flag] ? window[flag].$obj : undefined;
    if (obj) {
        obj.removeEventListener("mouseenter", onZanePopupFocus);
        obj.removeEventListener("mouseleave", onZanePopupFocus);
        obj.addEventListener("mouseenter", onZanePopupFocus);
        obj.addEventListener("mouseleave", onZanePopupFocus);
        return true;
    }
}
/**
 * 销毁日期选择弹窗
 * @param flag 
 */
function destroyZanePopup(flag: string) {
    if (window[flag]) {
        window[flag].removeCalendar && window[flag].removeCalendar()
        delete window[flag];
    }
}

/**
 * 显示日期选择弹窗
 * - 适用于外部通过代码控制弹窗显隐
 * - 内部通过 模拟click点击事件完成弹窗展现
 * @param delay 延迟时间显示时间；外部设计调整位置后显示弹窗时，传入延迟时间，避免弹窗位置错误
 */
function showPicker(delay: number) {
    const div = document.getElementById(id) as HTMLDivElement;
    div && (delay > 0 ? onTimeout(() => div.click(), delay) : div.click());
}

/**
 * 点击事件，激活日期选择
 * -- 定时器监听，找到弹出的日期框
 */
function onClick() {
    if (pickerInitialTimer && pickerInitialTimer.destroyed != true) {
        return;
    }
    //  定时器监听，找到弹窗进行自定义事件处理
    pickerInitialTimer = onInterval(() => {
        let counter: number = 0;
        initZanePopup(id) && counter++;
        range && initZanePopup(`${id}DOUBLE`) && counter++;
        counter == (range ? 2 : 1) && pickerInitialTimer.destroy();
    }, 10);
    const timeoutScope = onTimeout(() => pickerInitialTimer.destroyed || pickerInitialTimer.destroy(), 5000);
    pickerInitialTimer.onDestroy(() => timeoutScope.destroyed || timeoutScope.destroy());
}
/**
 * 日期选择组件挂载时
 */
function onZaneMounted() {
    // 进行特定样式加载名称加载
    // console.log("初始化完成", arguments);
}
/**
 * 日期选择弹窗焦点事件
 */
function onZanePopupFocus(e: MouseEvent) {
    //  对事件做延迟判断，取最后一次事件焦点值进行改变判断，避免range时，两个picker之间切换时，会触发两次，导致重复触发
    const type: typeof pickerLastStatus = e.type == "mouseenter" ? "focus" : "blur";
    pickerStatusArray.push(type);
    pickerStatusTimer && pickerStatusTimer.destroy();
    pickerStatusTimer = onTimeout(() => {
        const lastStatus = getFromArray(pickerStatusArray, -1);
        lastStatus && pickerLastStatus != lastStatus && emits(`picker-${lastStatus}` as any);
        //  清理状态
        pickerLastStatus = lastStatus;
        pickerStatusTimer = undefined;
        pickerStatusArray.splice(0);
    }, 0);
}
/**
 * 日期选择完成后
 * @param full range模式时，为 begin - end ；否则为begin值
 * @param begin 开始日期 
 * @param end 结束日期
 */
function onZaneDone(full: string, begin: string, end: string) {
    //  对格式做一下重新处理；zane-calendar 内部会把格式的 - 改为 /
    if (format.includes("-") == true) {
        begin && (begin = begin.replaceAll("/", "-"));
        end && (end = end.replaceAll("/", "-"));
    }
    emits("change", begin, end);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      注册  zane-calendar 所需css；交给外面进行替换
link.register("/styles/zane-calendar.css");
//  2、生命周期响应
onMounted(() => {
    script.has("zane-calendar") || throwError(`zane-calendar module unregistered.`);
    //  基于props参数初始化日期选择配置
    const zaneOptions: Record<string, any> = {
        elem: `#${id}`,
        type: `${range ? "double" : ""}${props.type || "day"}`,
        //  格式，初始值：内部会把-强制修改为 /，这里做一下兼容处理
        format: format,
        begintime: props.begin || "",
        endtime: props.end || "",
        min: props.min || "1900-10-01",
        max: props.max || "",
        zindex: props.zIndex || 10000,
        //  功能控制
        showtime: props.timeDisabled != true,
        showsecond: props.secondDisabled != true,
        showclean: props.cleanDisabled != true,
        shownow: props.nowDisabled != true,
        showsubmit: props.submitDisabled != true,
        //  布局
        width: props.width || 280,
        height: props.height || 300,
        behindTop: props.behindTop || 4,
        //  强制固定的配置
        lang: "cn",
        event: "click",
        position: "fixed",
        haveBotBtns: true,
        mounted: onZaneMounted,
        done: onZaneDone,
    }
    //  加载模块初始化 日期选择器
    script.load<(o: any) => void>("zane-calendar").then(
        calendar => {
            console.log(zaneOptions);
            isFunction(calendar) || throwError("load zane-calendar failed: value is not a function.");
            //  构建打开
            calendar(zaneOptions);
        },
        reason => throwError(reason),
    );
});
onUnmounted(() => {
    //  移除弹窗，并从window上移除对应对象
    destroyZanePopup(id);
    range && destroyZanePopup(`${id}DOUBLE`);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-datepicker {
    opacity: 0;
    //  绝对定位，填充父元素，隐藏溢出的内容，并定位到0,0位置
    .absolute-fill-hidden();
}
</style>