<!-- 滚动选择器：滚动选择指定项
    1、使用组件时，传入要滚动选择的项目
    2、选中项目发生变化时，通知外部做适配
    3、作为一个通用组件，不强制适配弹窗，具体如何使用，交给外部自己封装
 -->
<template>
    <div class="snail-scroll-picker wh-fill">
        <!-- 选择项目 -->
        <div class="pick-items" ref="pick-items">
            <span class="pick-item" v-for="item in items" :key="item.code"
                :class="{ selected: item.code === currentValue, disabled: item.disabled }" v-text="item.text" />
        </div>
        <!-- 选择区域：上面留白、中间选中结果、下面留白 -->
        <div class="pick-layer">
            <span class="layer-top"></span>
            <span class="layer-selection"></span>
            <span class="layer-bottom"></span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, useTemplateRef } from "vue";
import { ScrollPickerEvents, ScrollPickerOptions } from "./models/scroll-piker-model";
import { useObserver } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
const props = defineProps<ScrollPickerOptions>();
const emit = defineEmits<ScrollPickerEvents>();
const { onEvent } = useObserver();

/** 选择项根容器 */
const pickItemsDom = useTemplateRef("pick-items");

//  2、组件交互变量、常量

/** 每个选项的高度，与 CSS 中 .pick-item 的 height 保持一致 */
const ITEM_HEIGHT = 32;

/** 当前选中值 */
const currentValue = ref(props.value ?? props.items[0]?.code ?? "");

/** 当前偏移量（普通变量，不走响应式，直接操作 DOM） */
let currentY = 0;

/** 当前选中项的索引 */
const selectedIndex = computed(() => {
    return props.items.findIndex(item => item.code === currentValue.value);
});

// ---- 拖拽相关状态 ----
let isDragging = false;
let startY = 0;
let startTranslateY = 0;
let lastY = 0;
let lastTime = 0;
let velocity = 0;

/** 拖拽时的目标偏移量 */
let targetTranslateY = 0;

/** 拖拽跟随动画帧ID */
let followFrameId = 0;

/** 惯性/吸附动画帧ID */
let animFrameId = 0;

// *****************************************   👉  方法+事件    ****************************************

/**
 * 直接设置 DOM 的 transform（绕过 Vue 响应式，性能更好、更跟手）
 */
function setTransform(y: number) {
    currentY = y;
    const el = pickItemsDom.value;
    if (el) {
        el.style.transform = `translateY(${y}px)`;
    }
}

/**
 * 根据索引计算偏移量
 */
function getTranslateByIndex(index: number): number {
    return -index * ITEM_HEIGHT;
}

/**
 * 根据偏移量计算最近的合法索引（吸附）
 */
function getNearestIndex(offset: number): number {
    let index = Math.round(-offset / ITEM_HEIGHT);
    index = Math.max(0, Math.min(index, props.items.length - 1));
    // 跳过禁用项：向最近的有效项靠拢
    if (props.items[index]?.disabled) {
        let down = index, up = index;
        while (down < props.items.length || up >= 0) {
            down++;
            up--;
            if (down < props.items.length && !props.items[down].disabled) return down;
            if (up >= 0 && !props.items[up].disabled) return up;
        }
    }
    return index;
}

/**
 * 启动拖拽跟随动画：让 currentY 平滑追赶 targetTranslateY
 */
function startFollowAnimation() {
    cancelAnimationFrame(followFrameId);
    function step() {
        followFrameId = requestAnimationFrame(step);
        const diff = targetTranslateY - currentY;
        console.log(targetTranslateY - currentY);
        if (Math.abs(diff) < 0.5) {
            setTransform(targetTranslateY);
            return;
        }
        // 线性插值：每帧追赶剩余距离的一部分，系数越大跟手越快
        setTransform(currentY + diff * 0.3);
    }

    followFrameId = requestAnimationFrame(step);
}

/**
 * 平滑动画过渡到目标偏移量（easeOutCubic 缓动）
 */
function animateTo(targetY: number, onComplete?: () => void) {
    cancelAnimationFrame(animFrameId);

    const fromY = currentY;
    const distance = targetY - fromY;
    const duration = Math.min(600, Math.max(200, Math.abs(distance) * 2));
    const startTime = Date.now();

    function step() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutCubic 缓动：开始快，结束慢
        const eased = 1 - Math.pow(1 - progress, 3);

        setTransform(fromY + distance * eased);

        if (progress < 1) {
            animFrameId = requestAnimationFrame(step);
        } else {
            setTransform(targetY);
            onComplete?.();
        }
    }

    animFrameId = requestAnimationFrame(step);
}

/**
 * 吸附到最近的合法选项
 */
function snapToNearest() {
    const targetIndex = getNearestIndex(currentY);
    const targetY = getTranslateByIndex(targetIndex);

    animateTo(targetY, () => {
        const newItem = props.items[targetIndex];
        if (newItem && newItem.code !== currentValue.value) {
            currentValue.value = newItem.code;
            emit("select", newItem.code);
        }
    });
}

/**
 * 将列表定位到当前选中项（无动画）
 */
function scrollToCurrent() {
    const idx = selectedIndex.value;
    if (idx >= 0) {
        setTransform(getTranslateByIndex(idx));
    }
}

/**
 * 开始时
 */
function onStart(isTouch: boolean, position: { clientX: number, clientY: number }) {
    isDragging = true;
    cancelAnimationFrame(animFrameId); // 取消可能正在进行的吸附动画
    startY = position.clientY;
    startTranslateY = currentY;
    targetTranslateY = currentY;
    lastY = position.clientY;
    lastTime = Date.now();
    velocity = 0;

    startFollowAnimation();
}

/**
 * 移动时
 */
function onMove(isTouch: boolean, position: { clientX: number, clientY: number }) {
    if (!isDragging) return;

    const currentPosY = position.clientY;
    const now = Date.now();
    const deltaY = currentPosY - startY;

    // 计算瞬时速度（用于松手后的惯性）
    const dt = now - lastTime;
    if (dt > 0) {
        velocity = (currentPosY - lastY) / dt;
    }
    lastY = currentPosY;
    lastTime = now;

    // 更新目标偏移量（动画循环会平滑追赶）
    targetTranslateY = startTranslateY + deltaY;
}

/**
 * 结束时
 */
function onEnd(isTouch: boolean) {
    if (!isDragging) return;
    isDragging = false;

    // 停止跟随动画，确保位置精确
    cancelAnimationFrame(followFrameId);
    setTransform(targetTranslateY);

    // 惯性滑动：根据松手速度追加偏移，但限制最大惯性距离
    const maxInertia = ITEM_HEIGHT * 3;
    const inertiaDistance = Math.max(-maxInertia, Math.min(maxInertia, velocity * 100));
    const projectedY = currentY + inertiaDistance;

    // 边界约束
    const minY = getTranslateByIndex(props.items.length - 1);
    const maxY = getTranslateByIndex(0);
    const clampedY = Math.max(minY, Math.min(maxY, projectedY));

    // 用动画平滑过渡到惯性目标位置，然后吸附
    animateTo(clampedY, () => {
        snapToNearest();
    });
}

// *****************************************   👉  监听外部 value 变化    *****************************************
watch(() => props.value, (newVal) => {
    if (newVal !== undefined && newVal !== currentValue.value) {
        currentValue.value = newVal;
        scrollToCurrent();
    }
});

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    // 初始定位到选中项
    scrollToCurrent();

    //  监听事件（组件销毁时自动清理）
    const root = pickItemsDom.value.parentElement;
    if (!root) return;

    if ("ontouchstart" in window) {
        onEvent(root, "touchstart", (evt: TouchEvent) => onStart(true, evt.touches[0]));
        onEvent(window, "touchmove", (evt: TouchEvent) => onMove(true, evt.touches[0]));
        onEvent(window, "touchend", () => onEnd(true));
        onEvent(window, "touchcancel", () => onEnd(true));
    }
    if ("onmousedown" in window) {
        onEvent(root, "mousedown", (evt: MouseEvent) => onStart(false, evt));
        onEvent(window, "mousemove", (evt: MouseEvent) => onMove(false, evt));
        onEvent(window, "mouseup", () => onEnd(false));
    }
});

onBeforeUnmount(() => {
    cancelAnimationFrame(followFrameId);
    cancelAnimationFrame(animFrameId);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-scroll-picker {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    user-select: none;

    //  绝对定位，后面的覆盖前面；内部flex布局，水平垂直居中
    >div {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        >span {
            flex-shrink: 0;
            width: 100%;
        }
    }

    >.pick-items {
        height: fit-content;

        >.pick-item {
            height: 32px;
            line-height: 32px;
            text-align: center;
            user-select: none; // 防止拖拽时选中文本

            &.selected {
                color: #007bff;
            }

            &.disabled {
                color: #ccc;
                pointer-events: none;
            }
        }
    }

    //  选择区域
    >.pick-layer {
        height: 100%;

        >.layer-top,
        >.layer-bottom {
            background: linear-gradient(180deg, #fff 10%, rgba(255, 255, 255, .7));
            flex: 1;
        }

        >.layer-top {
            border-bottom: 1px solid #c8c7cc;
        }

        >.layer-selection {
            height: 32px;
        }

        >.layer-bottom {
            border-top: 1px solid #c8c7cc;
        }
    }
}
</style>