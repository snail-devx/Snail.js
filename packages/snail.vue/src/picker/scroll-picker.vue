<!-- 滚动选择器：
    1、使用组件时，传入要滚动选择的项目
    2、选中项目发生变化时，通知外部做适配
    3、可作为弹窗使用，此时固定到底部使用；也可直接嵌入组件中使用
 -->
<template>
    <div class="snail-scroll-picker wh-fill" :class="{ 'in-pupup': inPopup }">
        <!-- dialog模式下时，需要支持标题栏 -->
        <div class="pick-header" v-if="inPopup">ddd</div>
        <!-- 实际的选择内容区域 -->
        <div class="pick-body">
            <!-- 选择项目 -->
            <div class="pick-items" ref="pick-items">
                <span class="pick-item" v-for="item in items" :key="item.code"
                    :class="{ selected: item.code === valueRef, disabled: item.disabled }" v-text="item.text" />
            </div>
            <!-- 选择区域：上面留白、中间选中结果、下面留白 -->
            <div class="pick-layer">
                <span class="layer-top"></span>
                <span class="layer-selection"></span>
                <span class="layer-bottom"></span>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useTimer } from "snail.core";
import { ref, onMounted, useTemplateRef, shallowRef, ShallowRef } from "vue";
import { ScrollPickerEvents, ScrollPickerOptions } from "./models/scroll-piker-model";
import { ElasticDetail, IElasticManager, useElastic, useObserver } from "snail.view";
import { DialogHandle } from "../popup/models/dialog-model";
import { PopupStatusOptions } from "../popup/models/popup-model";
import { PickerExtend } from "./models/picker-model";
import { TitleOptions } from "../base/models/base-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ScrollPickerOptions & TitleOptions & Partial<DialogHandle<string> & PopupStatusOptions & PickerExtend>>();
const emits = defineEmits<ScrollPickerEvents>();
const { onSize } = useObserver();
const { onTimeout } = useTimer();
/** 选择项根容器 */
const pickItemsDom = useTemplateRef("pick-items");
/** 弹性滚动实例引用 */
const elasticRef: ShallowRef<IElasticManager> = shallowRef();
//  2、组件交互变量、常量
/** 每个选项的高度*/
const itemHeight = 32;
/** 当前选中项的值 */
const valueRef = ref(props.value ?? props.items[0]?.code ?? "");
/** 备份值 */
let backValue: string = undefined;

//  需要支持监听value值变化和items变化，实现响应式

// *****************************************   👉  方法+事件    ****************************************
/**
 * 选举选中项
 * - 若选中项为禁用，则继续往下推荐
 * @param itemIndex 
 * @param direction 滚动方向，1 向下；-1 向上；推荐时作为优先方向
 * @returns 选择项编码
 */
function electItem(itemIndex: number, direction: 1 | -1): string {
    throw new Error("还没实现，后期做实现");
}

/**
 * 处理弹性滚动，进行选项选择处理
 * @param detail 
 */
function onElastic(detail: ElasticDetail) {
    if (detail.status == "start") {
        backValue = valueRef.value;
    }
    //  计算当前应该选中的项目
    else {
        const index = parseInt((detail.position.y / itemHeight).toFixed(0));
        const item = props.items[-index];
        //  后期还需要判断选项是否禁用，若禁用则不允许被选择，
        valueRef.value = item ? item.code : undefined;
        //  结束时，进行位置偏移计算，确保显示完整行
        if (detail.status == "end") {
            elasticRef.value.scrollTo(undefined, index * itemHeight);
            //  选中值发生改变时，进行事件通知
            backValue != valueRef.value && emits("select", valueRef.value);
        }
        //  滚动过程中，这里考虑每移动32px的角度，只要还在滚动区域内，就给一次振动；后期再做
        else {
            // navigator.vibrate(10);
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
onMounted(async () => {
    //  监听根容器元素尺寸变化，然后同步修改滚动区域的padding值，从而让滚动项聚焦在中间
    onSize(pickItemsDom.value.parentElement, size => {
        const offset = (size.height - itemHeight) / 2;
        pickItemsDom.value.style.padding = `${offset}px 0`;
    });
    //  使用弹性滚动 进行选项选择
    elasticRef.value = useElastic(pickItemsDom.value, { elastic: "y", distance: 100, }, onElastic);
    //  基于外部传入值，进行选中滚动处理；加点延迟，避免样式问题影响
    const index = props.items.findIndex(item => item.code == valueRef.value);
    index != -1 && onTimeout(() => elasticRef.value.scrollTo(undefined, -itemHeight * index), 50);
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

    display: flex;
    flex-direction: column;

    // 标题头部
    >.pick-header {
        height: 40px;
        background-color: gray;
    }

    // 选择器内容区域
    >.pick-body {
        flex: 1;
        overflow: hidden;
        position: relative;

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

        //  选项渲染区域
        >.pick-items {
            height: fit-content;
            padding: calc(50% - 16px) 0;

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

            >.layer-top {
                flex: 1;
                background: linear-gradient(180deg, #fff 10%, rgba(255, 255, 255, .6));
                border-bottom: 1px solid #c8c7cc;
            }

            >.layer-selection {
                height: 32px;
            }

            >.layer-bottom {
                flex: 1;
                background: linear-gradient(0deg, #fff 10%, rgba(255, 255, 255, .6));
                border-top: 1px solid #c8c7cc;
            }
        }
    }


}

.snail-scroll-picker.dialog-body {
    align-self: flex-end;
    height: 200px;
}
</style>