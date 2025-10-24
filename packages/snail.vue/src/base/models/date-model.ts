/**
 * 日期组件相关数据模型
 */

/**
 * 日期选择组件 配置选项
 * - 参照 zane-calendar 组件的配置选项
 * @see https://github.com/wangweianger/zane-data-time-calendar/blob/master/README.md#%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E
 */
export type DatepickerOptions = {
    /**
     * 日期选择类型
     * - 默认值：day
     * - 可选值：
     * - - day            年月日选择
     * - - year           年选择
     * - - month          年月选择
     * - - time           时分秒选择
     */
    type?: "day" | "year" | "month" | "time";
    /**
     * 是否为范围选择
     * - true 则选择 开始时间 - 结束时间
     */
    range?: boolean;
    /**
     * 日期时间格式化
     * - 默认值：yyyy-MM-dd
     * - 可选值 通用格式化字符串；如  yyyy-MM-dd HH:mm:ss  yyyy年MM月dd日 HH时mm分ss秒 、、、
     */
    format?: string;

    /**
     * 开始日期
     * - 单选择可选项
     * - 作为初始选中日期，不传入则默认当前
     */
    begin?: string;
    /**
     * 结束日期 
     * - range 为true时 选择器可选项
     * - 作为初始选中日期，不传入则默认当前
     */
    end?: string;
    /**
     * 可选取时间最小范围
     * - 默认值：1900-10-01
     */
    min?: string;
    /**
     * 可选取时间最大范围
     * - 默认值：2099-12-31
     */
    max?: string;
    /**
     * 弹窗z-index值
     * - 默认：10000
     */
    zIndex?: number;

    /**
     * 是否禁用【选择时间】
     * - 为true时，不出【选择时间】按钮
     */
    timeDisabled?: boolean;
    /**
     * 是否禁用【选择秒】
     * - 为true时，选择时间时不支持选择秒单位
     */
    secondDisabled?: boolean;

    /**
     * 是否禁止【清空】按钮
     * - 为true时，不显示【清空【按钮
     */
    cleanDisabled?: boolean;
    /**
     * 是否禁用【现在】按钮
     * - 为true时，不显示【现在】按钮
     * - 在 type 为 doublexxx 时始终禁止
     * - 同时指定min和max时，时始终禁止
     */
    nowDisabled?: boolean;
    /**
     * 是否禁止【确定】按钮
     * - 为true时，不显示【确定】按钮
     */
    submitDisabled?: boolean;

    /**
     * 插件宽度配置
     * - 默认值：280
     * - 220 <= X <= 500
     */
    width?: number;
    /**
     * 插件高度配置
     * - 默认值：300
     * - 240 <= X <= 350
     */
    height?: number;
    /**
     * 插件与输入框的高度 
     * - 默认值：4
     */
    behindTop?: number;

    /*  暂不开放属性
    position:'fixed',  		定位方式，暂时只支持 fixed
    event:'click',   		事件方式，暂时只支持 click 
    haveBotBtns:true, 		是否有底部按钮列表
    */
}
/**
 * 日期选择器 组件事件
 */
export type DatePickerEvents = {
    /**
     * 日期选择器 选择值改变
     * @param begin 选择的起始日期；undefined表示无值，如清空时
     * @param end 选择的结束日期；在range范围选择时才有值；undefined表示无值，如清空时
     */
    change: [begin: string | undefined, end: string | undefined];

    /**
     * 日期选择器得到焦点
     * - 鼠标进入选择器
     */
    "picker-focus": [];
    /**
     * 日期选择器失去焦点
     * - 鼠标离开选择器
     */
    "picker-blur": [];
}