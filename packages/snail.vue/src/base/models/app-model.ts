/**
 * Vue应用程序实例相关
 */
import { App, createApp, provide } from "vue"

/** App类型 
 * - normal 普通app实例
 * - popup  弹窗app实例；包括 Dialog、Follow等所有弹窗
*/
export type AppType = "normal" | "popup";

/**
 * Vue 应用实例配置选项
 * - 用于在 {@link createApp} 后,执行{@link provide}方法注入，方便后代组件直取
 */
export type AppOptions = {
    /**
     * 应用模式
     * - 用于告知后台组件，现在的运行环境，方便后代组件实现多端交互适配
     * - 有效取值：
     * - - desktop 【默认值】面端页面应用，适合pc、笔记本等大屏幕渲染
     * - - mobile 移动端页面应用，适合小屏幕，如h5页面，嵌入app中的页面
     */
    mode?: "desktop" | "mobile"
}