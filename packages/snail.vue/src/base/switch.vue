<!-- 开关组件
    1、支持  v-model 双向绑定
    2、只读时禁用
    3、change事件通知值改变
    4、【后续】支持指定 开启、关闭 状态的文字、颜色
-->
<template>
    <div class="snail-switch" :class="[switchModel ? 'on' : 'off', readonly ? 'readonly' : '']"
        v-bind:class="type || 'switch'" @click="onSwitchChange">
        <!-- 单选复选展示效果 -->
        <template v-if="type == 'checkbox' || type == 'radio'">
            <Icon v-if="switchModel" :type="'success'" :color="'white'" :size="16" />
        </template>
        <!-- 默认渲染效果 -->
        <template v-else>
            <div class="wh-fill on" />
            <div class="wh-fill off" />
            <div class="status" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { nextTick } from "vue";
import { SwitchEvents, SwitchOptions } from "./models/switch-model";
import Icon from "./icon.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SwitchOptions>();
const emits = defineEmits<SwitchEvents>();
/**     开关值：开启还是关闭 */
const switchModel = defineModel<boolean>({ default: false });
//  2、可选配置选项
defineOptions({ name: "Switch", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 触发开关切换
 */
function onSwitchChange() {
    if (props.readonly == true) {
        return;
    }
    //  更新绑定值，延迟change事件；外部同时使用v-model和change事件时，valueModel.value修改不会立马生效
    switchModel.value = !switchModel.value;
    nextTick(() => emits("change", switchModel.value));
}
</script>

<!-- 默认效果渲染 -->
<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

//  开关公共样式
.snail-switch {
    position: relative;
    overflow: hidden;
    cursor: pointer;

    //  只读状态样式
    &.readonly {
        // cursor: default;
        cursor: not-allowed;
    }
}

//  【switch】模式渲染效果
.snail-switch.switch {
    width: 36px !important;
    height: 20px !important;
    border-radius: 10px 10px 10px 10px;

    //  动画效果
    @left-transition: left 0.2s ease;

    >div.on {
        background-color: #5CA3FF;
    }

    >div.off {
        position: absolute;
        background-color: #C4C8CC;
        transition: @left-transition;
    }

    >div.status {
        position: absolute;
        height: 16px;
        width: 16px;
        top: 2px;
        border-radius: 10px 10px 10px 10px;
        background: white;
        transition: @left-transition;
    }

    //  不同状态时的效果
    &.on {
        >div.off {
            top: 0;
            left: 100%;
        }

        >div.status {
            left: calc(100% - 18px);
        }
    }

    &.off {
        >div.off {
            // x、y起始位置：left:0,top:0
            .left-top-start();
        }

        >div.status {
            left: 2px;
        }
    }
}
</style>

<!--【radio】和【checkbox】模式渲染效果 -->
<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

// 公共样式
.snail-switch.radio,
.snail-switch.checkbox {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.off {
        border: solid 1px #dcdfe6;
    }

    &.on {
        border: solid 1px #4c9aff;
        background-color: #4c9aff;
    }
}

// radio 特殊样式,圆角
.snail-switch.radio {
    border-radius: 50%;
}
</style>