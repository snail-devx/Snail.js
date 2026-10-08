<!-- Elastic 弹性容器插件：滚动条扩展
    1、在弹性容器 拖拽时，实时渲染滚动条信息
    2、样式信息挂载到 .snail-elastic 下
-->
<template>
    <div v-if="elastic == 'both' || elastic == 'x'" class="x-bar" :style="xbarStyleRef" />
    <div v-if="elastic == 'both' || elastic == 'y'" class="y-bar" :style="ybarStyleRef" />
</template>

<script setup lang="ts">
import { ElasticDetail } from 'snail.view';
import { shallowRef, ShallowRef } from 'vue';
import { useReactive } from '../../base/reactive';
import { ElasticSlotHandle } from '../models/elastic-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ElasticSlotHandle>();
const { watcher } = useReactive();
const { target, elastic } = props;
//  2、组件交互变量、常量
/** 滚动条结束时的定时器 */
let barEndTimer: NodeJS.Timeout = undefined;
/** x轴滚动条样式 */
const xbarStyleRef: ShallowRef<Record<string, any>> = shallowRef(undefined);
/** y轴滚动条样式 */
const ybarStyleRef: ShallowRef<Record<string, any>> = shallowRef(undefined);

// *****************************************   👉  方法+事件    ****************************************
/**


// *****************************************   👉  方法+事件    ****************************************
/**
 * 弹性滚动状态变化处理
 * @param detail 
 */
function onDetailChange(detail: ElasticDetail) {
    barEndTimer && clearTimeout(barEndTimer);
    barEndTimer = undefined;
    xbarStyleRef.value = undefined;
    ybarStyleRef.value = undefined;
    // 水平滚动条
    if (elastic == "both" || elastic == "x") {
        const xbar = calcBarStyle(target.parentElement.clientWidth, target.clientWidth, detail.position.x);
        xbarStyleRef.value = {
            width: xbar.size == undefined ? "0" : `${xbar.size}px`,
            left: xbar.position == undefined ? "0" : `${xbar.position}px`,
        }
    }
    // 垂直滚动条
    if (elastic == "both" || elastic == "y") {
        const ybar = calcBarStyle(target.parentElement.clientHeight, target.clientHeight, detail.position.y);
        ybarStyleRef.value = {
            height: ybar.size == undefined ? "0" : `${ybar.size}px`,
            top: ybar.position == undefined ? "0" : `${ybar.position}px`,
        }
    }
    //  更新样式：若为结束状态，则延迟关闭滚动条
    detail.status == "end" && (barEndTimer = setTimeout(function () {
        xbarStyleRef.value && (xbarStyleRef.value = { ...xbarStyleRef.value, opacity: 0 });
        ybarStyleRef.value && (ybarStyleRef.value = { ...ybarStyleRef.value, opacity: 0 });
    }, 400));
}
/**
 * 计算滚动条样式：大小和位置
 * - 支持水平、垂直滚动条的设置
 * @param parentSize 容器父的尺寸，宽度/高度
 * @param size  内容尺寸，宽度/高度
 * @param position 内容元素位置，x/y轴
 */
function calcBarStyle(parentSize: number, size: number, position: number): { size: number, position: number } {
    //  position >=0 向下、向右时； position 始终为0,但是尺寸要加上position
    if (position >= 0) {
        size += position;
        size = Math.floor((parentSize / size) * parentSize);
        position = 0;
    }
    //  position <0 向上、向左时；到结束位置后，固定在结束为止，但尺寸要加上溢出的尺寸
    else {
        //  计算溢出尺寸：若内容尺寸小于容器尺寸，则溢出尺寸为0
        const minOffset = Math.min(0, parentSize - size);
        if (position < minOffset) {
            size += minOffset - position;
        }
        //  计算尺寸大小和比例
        const scale = parentSize / size;
        size = Math.floor(scale * parentSize);
        position = Math.floor((-position) * scale);
    }
    //  超出最大尺寸时，忽略滚动条；如内容尺寸小于内容尺寸时
    parentSize <= size && (size = 0);
    return { size, position };
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
watcher(() => props.detail, onDetailChange);
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic {

    .x-bar,
    .y-bar {
        position: absolute;
        background-color: #c3c7cb;
        z-index: 2;
        border-radius: 2px;
        transition: all 0.2s linear;
        opacity: 1;
    }

    .x-bar {
        height: 2px;
        bottom: 0;
    }

    .y-bar {
        width: 2px;
        right: 0;
    }
}
</style>