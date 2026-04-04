import { TitleOptions } from "./base-model";

/**
 * 图标配置选项
 * - title          作为鼠标移入图标时的提示
 */
export type IconOptions = TitleOptions & {
    /**
     * 是否为自定义图标
     * - 为true时，外部通过插槽自己绘制图标
     * - 为false时，使用`type`值绘制对应的内置图标
     * - 默认false
     */
    custom?: boolean;
    /** 
     * 内置的图标类型
     * - `custom`为false时生效
     */
    type?: IconType;

    /**
     * 是否是按钮图标
     * - true时，鼠标移入时 cursor:pointer;
     */
    button?: boolean;

    /** 
     * 图标大小
     * - 可指定对象，如 { width: 24, height: 24 }，则图标大小为 24 * 24
     * - 可指定数字，如 24，则图标大小为 24 * 24
     * - 默认 24
     */
    size?: number | { width?: number, height?: number };
    /** 
     * 图标颜色 
     */
    color?: string;
    /**
     * 鼠标移入时的图标颜色
     */
    hoverColor?: string;
    /**
     * 旋转角度
     * - 默认0
     * - 通过：transform: rotate(1.06); 实现
     */
    rotate?: number;

    /**
     * 图形伸展
     * - svg.viewBox 属性
     * - 为空则默认“0 0 1024 1024”
     */
    viewBox?: string;
}

/**
 * 图标类型
 * - 状态类：
 * - - success      成功图标，对勾
 * - - error        错误 
 * - - warn         警告图标
 * - 操作类：
 * - - close        关闭 用作数据删除，弹窗关闭
 * - - trash        垃圾桶图标，常用于【删除】操作
 * - - download     下载
 * - - print        打印
 * - - edit         编辑
 * - 指向类：
 * - - arrow        向右箭头
 * - - datepicker   日期选择器
 * - - timepicker   时间选择器
 * - 其他类：
 * - - plus         加号
 * - - subtract     减号
 * - - grip         紧握图标，垂直方向，一般用于拖动句柄
 */
export type IconType = "success" | "error" | "warn"
    | "close" | "trash" | "download" | "print" | "edit"
    | "arrow" | "datepicker" | "timepicker"
    | "plus" | "subtract" | "grip";