/**
 * 导航相关扩展：如设备类型判断、、、
 */

import { IScope, IScopes, mountScope, useScopes } from "../../common";
import { INavigator } from "../models/navigator-model";

/**
 * 使用【导航器】
 * - 提供设配类型判断，设备获取（如录音、蓝牙等）
 * @returns 导航器+作用域实例
 */
export function useNavigator(): INavigator & IScope {
    /** 作用域组 */
    const scopes: IScopes = useScopes();

    //#region ************************************* 接口方法：INavigator具体实现 *************************************
    /**
     * 获取设备类型
     * @returns 
     */
    function getDeviceType(): ReturnType<INavigator["getDevice"]> {
        if (window.navigator && window.navigator.userAgent) {
            const userAgent = navigator.userAgent.toLowerCase();
            //  微信浏览器
            if (/micromessenger/i.test(userAgent)) {
                return "wechat";
            }
            // 优先匹配明确的移动端标识（涵盖大部分手机和平板）；兼容部分老旧或小众移动浏览器，寻找 "Mobi" 关键字（MDN推荐做法）
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || /Mobi/i.test(userAgent)) {
                return "mobile";
            }
            //  其他情况，默认 pc 客户端
            return "pc";
        }
        return "unknown";
    }
    /**
     * 获取操作系统类型
     * @returns 
     */
    function getOS(): ReturnType<INavigator["getOS"]> {
        if (window.navigator && window.navigator.userAgent) {
            const userAgent = navigator.userAgent.toLowerCase();
            //  Windows 系列
            if (/Windows/i.test(userAgent)) {
                return 'Windows';
            }
            //  苹果系列：优先判断 iOS (包含 iPhone, iPad, iPod)；再判断 macOS (在排除了 iOS 之后进行判断)
            if (/iPhone|iPad|iPod/i.test(userAgent)) {
                return 'iOS';
            }
            if (/Macintosh|Mac OS X/i.test(userAgent)) {
                return 'MacOS';
            }
            //  Linux 系列：优先判断 Android；再判断 Linux (在排除了 Android 之后进行判断)
            if (/Android/i.test(userAgent)) {
                return 'Android';
            }
            if (/Linux/i.test(userAgent)) {
                return 'Linux';
            }
        }
        //  未知系统兜底
        return 'Unknown';
    }
    //#endregion

    //#region ************************************* 辅助方法                   *************************************

    //#endregion

    //  构建实例：并实时销毁scopes作用域组
    {
        const navigator: INavigator & IScope = mountScope<INavigator>({
            getDevice: getDeviceType,
            getOS
        }, "INavigator");
        navigator.onDestroy(scopes.destroy);
        return navigator;
    }
}