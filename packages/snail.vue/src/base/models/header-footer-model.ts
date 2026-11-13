import { AlignOptions, DisabledOptions, TitleOptions } from "./base-model";
import { ButtonOptions } from "./button-model";

/**
 * 页面头部配置选项
 * - header.vue 组件使用
 * - title          将作为头部标题，无则不展示标题区域
 * - algin          弹窗标题对齐方式：默认值 center
 */
export type HeaderOptions = TitleOptions & AlignOptions & {
    /**
     * 使用到哪里
     * - page   ：页面头部：默认类型；标题、关闭按钮等对齐一行；
     * - dialog ：弹窗头部；标题、关闭按钮等对齐两行，错开排列
     */
    useTo: "page" | "dialog";
    /**
     * 是否启用分割线
     * 启用后，则组件顶部设置边框 border-bottom: 1px solid #dddfed;;
     */
    divider?: boolean;

    /** 禁用【关闭】按钮
     * - 默认值false 
     */
    closeDisabled?: boolean;
}
/**
 * 页面头部事件
 * - header.vue 组件使用
 */
export type HeaderEvents = {
    /**
     * 关闭按钮点击事件
     */
    close: [];
};

/**
 * 尾部 组件配置选项
 * - 集成 {@link AlignOptions} align 属性；内部的按钮水平方向对齐方式：默认值 end 
 * - 集成 {@link DisabledOptions} disabled 属性；是否禁用，禁用时不显示
 */
export type FooterOptions = AlignOptions & {
    /**
     * 是否启用分割线
     * - 启用后，则组件顶部设置边框
     */
    divider?: boolean;
    /**
     * 底部操作按钮
     */
    buttons: FooterButton[];
};
/**
 * 尾部 组件事件
 */
export type FooterEvents = {
    /**
     * 按钮点击事件
     * - @param id 按钮id
     * - @param evt 事件对象
     */
    click: [id: string, evt: MouseEvent | TouchEvent | PointerEvent];
};
/**
 * 尾部按钮项
 */
export type FooterButton = {
    /**
     * 按钮id
     * - 确保唯一；点击时事件触发使用
     */
    id: string;
    /**
     * 按钮名称
     */
    name: string;
    /**
     * 按钮点击时的处理方法
     */
    click?: () => any;
} & Pick<ButtonOptions, "type" | "size"> & DisabledOptions;