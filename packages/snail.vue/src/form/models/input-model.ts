import { BaseStyle, FlexBoxStyle, WidthStyle } from "snail.view"
import { DisabledOptions, PlaceholderOptions, ReadonlyOptions, TitleOptions } from "../../base/models/base-mode";

/**
 * 输入框配置选项
 * - title          将作为 输入框标题区域文本；不传入则不展示 标题区域，仅展示输入框
 * - 暂不提供 disabled 逻辑
 */
export type InputOptions = ReadonlyOptions & /*DisabledOptions & */PlaceholderOptions & TitleOptions & {
    /**
     * 输入框类型
     * - text: 文本输入框
     * - number: 数字输入框
     * - password: 密码输入框
     */
    type?: "text" | "number" | "password";

    /**
     * 输入框是否必填
     * - 必填，则验证不通过时，显示错误信息
     * - 必填时，显示必填标记，红色 * 号
     */
    required?: boolean;

    /**
     * 标题区域样式
     * - 对齐方式
     * - 标题区域宽度
     */
    titleStyle?: BaseStyle & WidthStyle & FlexBoxStyle;
    /**
     * 输入框自定义验证方法
     * @param value 输入框文本值
     * @returns 返回 非空字符串 则表示验证失败原因；否则验证通过
     * - 暂时不对外开放
     
    validate?: (value: string) => string | undefined | Promise<string | undefined>
     */
}

/**
 * 输入框事件
 */
export type InputEvents = {
    /**
     * 输入框点击时
     */
    click: [];

    /**
     * 输入框内容发生改变时
     * @param value 输入框内容
     */
    change: [value: string];

    /**
     * 输入框内容验证结果
     * - 仅在required、配置自定义验证登情况时生效
     * @param value 是否通过验证
     * @param reason 验证失败的原因
    
    validate: [value: boolean, reason: string]; 
    */
}