<!-- 开关组件
    1、支持  v-model 双向绑定
    2、只读时禁用
    3、change事件通知值改变
    4、【后续】支持指定 开启、关闭 状态的文字、颜色
-->
<template>
    <div class="snail-switch" :class="[switchModel ? 'on' : 'off', props.readonly ? 'readonly' : '']"
        @click="onSwitchChange">
        <div class="on" />
        <div class="off" />
        <div class="status" />
    </div>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated } from "vue";
import { SwitchEvents, SwitchOptions } from "./models/switch-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SwitchOptions>();
const emit = defineEmits<SwitchEvents>();
/**     开关值：开启还是关闭 */
const switchModel = defineModel<boolean>({ default: false });
//  2、可选配置选项
defineOptions({ name: "Switch", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 触发开关切换
 */
function onSwitchChange() {
    if (props.readonly != true) {
        switchModel.value = !switchModel.value;
        emit("change", switchModel.value);
    }
}
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

@left-transition: left 0.2s ease;

.snail-switch {
    width: 36px !important;
    height: 20px !important;
    border-radius: 10px 10px 10px 10px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    >div {
        // 高度、宽度填充100%
        .wh-fill();
    }

    >div.on {
        background-color: #5CA3FF;
    }

    >div.off {
        background-color: #C4C8CC;
        position: absolute;
        transition: @left-transition;
    }

    >div.status {
        height: 16px;
        width: 16px;
        border-radius: 10px 10px 10px 10px;
        background: #FFFFFF;
        position: absolute;
        top: 2px;
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
        top: 0;
        left: 0
    }

    >div.status {
        left: 2px;
    }
}

//  只读状态样式
.snail-switch.readonly {
    cursor: default;
}
</style>