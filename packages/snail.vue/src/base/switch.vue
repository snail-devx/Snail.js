<!-- 开关组件
    1、支持  v-model 双向绑定
    2、只读时禁用
    3、change事件通知值改变
    4、【后续】支持指定 开启、关闭 状态的文字、颜色
-->
<template>
    <div class="snail-switch" :class="[switchModel ? 'on' : 'off', readonly ? 'readonly' : '']" @click="onSwitchChange">
        <div class="on" />
        <div class="off" />
        <div class="status" />
    </div>
</template>

<script setup lang="ts">
import { nextTick } from "vue";
import { SwitchEvents, SwitchOptions } from "./models/switch-model";

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

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

@left-transition: left 0.2s ease;

.snail-switch {
    position: relative;
    width: 36px !important;
    height: 20px !important;
    overflow: hidden;
    border-radius: 10px 10px 10px 10px;
    cursor: pointer;

    >div {
        // width:100%；height:100%
        .wh-fill();
    }

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
}

// *****************************************   👉  特殊样式适配    *****************************************
//  开启、关闭状态样式
.snail-switch.on {
    >div.off {
        top: 0;
        left: 100%;
    }

    >div.status {
        left: calc(100% - 18px);
    }
}

.snail-switch.off {
    >div.off {
        // x、y起始位置：left:0,top:0
        .left-top-start();
    }

    >div.status {
        left: 2px;
    }
}

//  只读状态样式
.snail-switch.readonly {
    // cursor: default;
    cursor: not-allowed;
}
</style>