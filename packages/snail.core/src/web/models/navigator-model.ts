/**
 * 导航相关
 * - 提供设配类型判断，设备获取（如录音、蓝牙等）
 */
export interface INavigator {
    /**
     * 获取设备类型
     * - pc pc客户端
     * - mobile 移动端设备
     * - wechat 微信浏览器；作为特殊情况设备类型，方便进行微信生态下的特定适配
     * - unknown 未知客户端
     * @returns 设备类型枚举值
     */
    getDevice(): "pc" | "mobile" | "wechat" | "unknown";
    /**
     * 获取操作系统
     * - Windows    windows系统
     * - MacOS      苹果macOS系统
     * - Linux      linux系统
     * - Android    安卓系统
     * - iOS        苹果iOS系统
     * - Unknown    未知系统
     * @returns 操作系统枚举值
     */
    getOS(): "Windows" | "MacOS" | "Linux" | "Android" | "iOS" | "Unknown";
}