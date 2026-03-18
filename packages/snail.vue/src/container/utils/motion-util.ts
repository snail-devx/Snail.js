import { hasOwnProperty } from "snail.core";
import { MotionEffectOptions } from "../models/motion-model";

/**
 * 运动组件的助手方法变量
 */

/**
 * 运行效果常量
 */
export const MOTION = Object.freeze({
    /** 淡入淡出；进入时 `opacity:0~1`；退出时 `opacity:1~0`*/
    "fade": { enter: "fade-in", leave: "fade-out" },
    /** 缩放进入：进入时 `scale:0~1`；退出时 `scale:1~0`*/
    "scale": { enter: "scale-in", leave: "scale-out" },
    /** 旋转：进入时 `rotate:360deg~0`；退出时 `rotate:0~360deg`*/
    "rotate": { enter: "rotate-in", leave: "rotate-out" },
    /** 顶部进入退出：进入时`translateY:-100%~0`；退出时`translateY:0~-100%`*/
    "top": { enter: "top-in", leave: "top-out" },
    /** 顶部进入底部退出：进入时`translateY:-100%~0`；退出时`translateY:0~100%`*/
    "topBottom": { enter: "top-in", leave: "bottom-out" },
    /** 底部进入退出：进入时`translateY:100%~0`；退出时`translateY:0~100%`*/
    "bottom": { enter: "bottom-in", leave: "bottom-out" },
    /** 底部进入顶部退出：进入时`translateY:100%~0`；退出时`translateY:0~-100%`*/
    "bottomTop": { enter: "bottom-in", leave: "top-out" },
    /** 左侧进入退出：进入时`translateX:-100%~0`；退出时`translateX:0~-100%`*/
    "left": { enter: "left-in", leave: "left-out" },
    /** 左侧进入右侧退出：进入时`translateX:-100%~0`；退出时`translateX:0~100%`*/
    "leftRight": { enter: "left-in", leave: "right-out" },
    /** 右侧进入右侧退出：进入时`translateX:100%~0`；退出时`translateX:0~100%`*/
    "right": { enter: "right-in", leave: "right-out" },
    /** 右侧进入左侧退出：进入时`translateX:100%~0`；退出时`translateX:0~-100%`*/
    "rightLeft": { enter: "right-in", leave: "left-out" },
});
for (var key in MOTION) hasOwnProperty(MOTION, key) && Object.freeze(MOTION[key]);