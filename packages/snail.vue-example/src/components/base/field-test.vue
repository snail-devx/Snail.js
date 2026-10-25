<!-- 组件介绍写到这里 -->
<template>
    <!-- <div style="display:flex;flex-direction:column;flex-wrap:wrap">
        <div style="width: 145px;">标题</div>
        <div style="flex: 1;">控件</div>
        <div>提示</div>
        <div>错误</div>
    </div> -->
    <div style="display:grid;grid-column: 145px auto-fit;">
        <div style="grid-column: 1;grid-row: span 3;">标题</div>
        <div style="grid-column: 2;">控件</div>
        <div style="grid-column-start: 2;">提示</div>
        <div style="grid-column-start: 2;">错误</div>
    </div>

    <Fold class="field-test-container" :title="'桌面客户端'">
        <Env :mode="'desktop'">
            <h4>水平方向</h4>
            <Field :title="'反馈时间'" required>
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required>
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required>
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required>
                <textarea />
            </Field>
            <Field :title="'反馈时间'" required>
                <div>反馈时间</div>
            </Field>
            <Field :title="'反馈时间'" required>
                <span>反馈时间</span>
            </Field>
            <Field :title="'反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间'" :error="'ddd'"
                :description="'x'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间反馈时间'" :error="'ddd'"
                :description="'x'">
                <textarea />
            </Field>
            <h4>垂直方向</h4>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <textarea />
            </Field>
            <Field :title="'反馈时间'" :error="'ddd'" :description="'x'" :direction="'vertical'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" :error="'ddd'" :description="'x'" :direction="'vertical'">
                <textarea />
            </Field>
            <h4>混排布局</h4>
            <Field :title="'反馈时间'" required :direction="'horizontal'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <input type="text" />
            </Field>
        </Env>
    </Fold>
    <Fold class="field-test-container mobile" :title="'移动端'">
        <Env :mode="'mobile'">
            <h4>水平方向</h4>
            <Field :title="'反馈时间'" required>
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required>
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required>
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required>
                <textarea />
            </Field>
            <Field :title="'反馈时间'" required>
                反馈时间
            </Field>
            <Field :title="'反馈时间'" required>
                <span>反馈时间</span>
            </Field>
            <Field :title="'反馈时间'" :error="'ddd'" :description="'x'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" :error="'ddd'" :description="'x'">
                <textarea />
            </Field>
            <h4>垂直方向</h4>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <textarea />
            </Field>
            <Field :title="'反馈时间'" :error="'ddd'" :description="'x'" :direction="'vertical'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" :error="'ddd'" :description="'x'" :direction="'vertical'">
                <textarea />
            </Field>
            <h4>混排布局</h4>
            <Field :title="'反馈时间'" required :direction="'horizontal'">
                <input type="text" />
            </Field>
            <Field :title="'反馈时间'" required :direction="'vertical'">
                <input type="text" />
            </Field>
        </Env>
    </Fold>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { components } from '../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Env, Field, Fold } = components;
//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
// setPageMode("mobile");
//  2、生命周期响应
onMounted(() => {

});

</script>

<style lang="less">
.field-test-container {
    border: 1px solid gray;
    margin-bottom: 10px;

    >div.fold-body {
        padding: 0;
        display: flex;
        flex-wrap: wrap;
    }

    h4 {
        width: 100%;
        background: white;
    }

    .snail-field {
        width: 50%;

        &::after {
            position: absolute;
            content: " ";
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1px;
            opacity: 0.2;
            background-color: gray;
        }
    }

    .snail-field.mobile {
        margin-bottom: 10px;

        &::after {
            content: unset;
        }
    }

    background-color: #f7f8f9;

    &.mobile {
        background-color: #f7f8f9;
    }
}
</style>