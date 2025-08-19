import { ComponentBindOptions, ComponentOptions } from "./component-model";

/**
 * 动态加载组件 组件配置选项
 */
export type DynamicOptions<Props = void> = ComponentOptions & Pick<ComponentBindOptions<Props>, "props">;