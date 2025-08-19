import { Component, Ref, shallowRef, ShallowRef } from "vue";

/**
 * 组件配置选项
 */
export type ComponentOptions = {
    /**
     * 组件名称；
     * - 确保组件已注册，否则会加载不出来
     */
    name?: string;
    /**
     * Vue组件对象
     * - name未传入时生效
     */
    component?: Component;
    /**
     * 组件js文件url地址
     * - 支持#号锚点钻取
     * - name、component未传入时生效
     * - 推荐外部使用 shallowRef 包裹对象，避免响应式的性能问题
     */
    url?: string;
}
/**
 * 提取【组件事件】类型
 * - 将【组件事件】中的key首字母小写，追加上on前缀；key对应的value为监听函数参数
 * - T的类型约束：Record<string, unknown[]>
 */
export type EventsType<Events> = Events extends Record<string, unknown[]>
    ? (/* 不用约束必须有key，后续看情况
        keyof T extends never
        ? never
        :*/ {
            [key in keyof Events as `on${Capitalize<string & key>}`]?: (...args: Events[key]) => void
        })
    : never;
/**
 * 提取组件的props类型
 * - 有效的 Props 类型：extends Record<string, any>
 * - 有效类型则返回 Props 自身；否则无效，为undefined
 */
export type PropsType<Props> = Props extends Record<string, any> ? Props : undefined;

/**
 * 组件绑定 配置选项
 * - Props、Events、Model 为可选泛型，分别约束 props、events、model 属性
 * - 若泛型类型无效，则对应属性类型强制为undefined；详细参照对应属性说明
 */
export type ComponentBindOptions<Props = void, Model = void> = {
    /**
     * 传递给组件的属性值，执行 v-bind 绑定
     * - key为属性名称，遵循vue解析规则；若绑定事件，则key为 on事件名称 ，事件名称首字母大写
     * - 通过泛型类型 Props 约束，有效类型：Props extends Record<string, any>
     * @see EventsType<Events> 获取组件事件类型
     */
    props?: PropsType<Props>;

    /**
     * 传递给组件的双向绑定数据，执行 v-model 绑定
     * - 使用 ShallowRef/Ref 包裹；推荐 ShallowRef，仅和组件进行.value值交互，避免深层双向影响性能
     * - 通过泛型类型 Model 约束，有效类型： 非void、never、null、undefined等无效类型
     */
    model?: Model extends (void | never | null | undefined) ? undefined : (ShallowRef<Model> | Ref<Model>);
}