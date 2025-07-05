/**
 * 按钮配置选项
 */
export type ButtonOptions = {
    /**
     * 按钮尺寸
     * - max    ： 120 X 40
     * - middle ： 80 X 32
     * - normal ： 54 X 28
     * - small  ： 30 X 20
     */
    size: "max" | "middle" | "normal" | "small";
    /**
     * 按钮类型
     *  - primary: 主按钮：蓝色背景
     *  - default: 默认按钮：白色背景
     *  - link   ：链接式按钮：蓝色字体颜色，无边框
     */
    type: "primary" | "default" | "link";
}