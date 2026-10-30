/**
 * Vue应用程序实例相关
 */
import { IScriptManager, script } from "snail.core";
import { createApp, provide } from "vue";

/** App类型 
 * - normal 普通app实例
 * - popup  弹窗app实例；包括 Dialog、Follow等所有弹窗
*/
export type AppType = "normal" | "popup";

/**
 * Vue 应用环境信息
 * - 用于在 {@link createApp} 后,执行{@link provide}方法注入，方便后代组件直取
 */
export type AppEnv = {
    /**
     * 应用模式
     * - 当前处于哪种模式，方便组件进行多端适配
     * - 有效取值：
     * - - desktop 【默认值】面端页面应用，适合pc、笔记本等大屏幕渲染
     * - - mobile 移动端页面应用，适合小屏幕，如h5页面，嵌入app中的页面
     */
    mode: "desktop" | "mobile";

    /**
     * 脚本管理器
     * - 用于后后代组件中管理脚本，如加载、卸载等
     * - 实现脚本管理隔离，避免所有脚本都堆到全局{@link script}中
     * - 若不指定，则默认使用全局{@link script}
     */
    script?: IScriptManager;
}