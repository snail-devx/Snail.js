/**
 * loading提示框的配置选项
 */
export type LoadingOptions = {
    /**
     * 是否显示loading效果
     * - 默认值：false
     */
    show: boolean;

    /**
     * 禁用【遮罩层】
     * - false  显示遮罩层
     * - true   不显示遮罩层
     */
    maskDisabled?: boolean;
    /**
     * loading的根样式
     * - 外部传入后，可进行自由定制loading样式
     */
    rootClass?: string | string[];
    /**
     * loading组件显示隐藏的动画名
     * - 默认：snail-loading
     */
    transition?: string;
}