/**
 * 动态加载url组件测试
 */

import { Component } from "vue";

/**
 * 默认组件
 */
export default {
    name: "dynamic-default",
    template: "<div>url默认组件。$attrs:{{$attrs}}</div>",
} as Component;

/**
 * 动态组件测试
 */
export const comp: Component = {
    template: "<div>url动态组件。$attrs:{{$attrs}}</div>",
}

/**
 * 内部报错的组件：
 */
export const errorSetup: Component = {
    template: "<div>setup报错组件。$attrs:{{$attrs}}</div>",
    setup() {
        throw new Error("setup错误测试");
    },
    // mounted() {
    //     throw new Error("Url错误组件");
    // },
}
/**
 * 内部报错的组件：
 */
export const errorMounted: Component = {
    template: "<div>mounted报错组件。$attrs:{{$attrs}}</div>",

    mounted() {
        throw new Error("mounted错误测试");
    },
}