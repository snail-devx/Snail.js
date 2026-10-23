import { hasOwnProperty } from "snail.core";

/**
 * 运动组件的助手方法变量
 */

/**
 * 运行效果常量
 */
export const MOTION = Object.freeze({
    /** 淡入淡出；进入时 `opacity:0~1`；退出时 `opacity:1~0`*/
    "fade": { in: "fade-in", out: "fade-out" },
    /** 缩放进入：进入时 `scale:0~1`；退出时 `scale:1~0`*/
    "scale": { in: "scale-in", out: "scale-out" },
    /** 旋转：进入时 `rotate:360deg~0`；退出时 `rotate:0~360deg`*/
    "rotate": { in: "rotate-in", out: "rotate-out" },
    /** 顶部进入退出：进入时`translateY:-100%~0`；退出时`translateY:0~-100%`*/
    "top": { in: "top-in", out: "top-out" },
    /** 顶部进入底部退出：进入时`translateY:-100%~0`；退出时`translateY:0~100%`*/
    "topBottom": { in: "top-in", out: "bottom-out" },
    /** 底部进入退出：进入时`translateY:100%~0`；退出时`translateY:0~100%`*/
    "bottom": { in: "bottom-in", out: "bottom-out" },
    /** 底部进入顶部退出：进入时`translateY:100%~0`；退出时`translateY:0~-100%`*/
    "bottomTop": { in: "bottom-in", out: "top-out" },
    /** 左侧进入退出：进入时`translateX:-100%~0`；退出时`translateX:0~-100%`*/
    "left": { in: "left-in", out: "left-out" },
    /** 左侧进入右侧退出：进入时`translateX:-100%~0`；退出时`translateX:0~100%`*/
    "leftRight": { in: "left-in", out: "right-out" },
    /** 右侧进入右侧退出：进入时`translateX:100%~0`；退出时`translateX:0~100%`*/
    "right": { in: "right-in", out: "right-out" },
    /** 右侧进入左侧退出：进入时`translateX:100%~0`；退出时`translateX:0~-100%`*/
    "rightLeft": { in: "right-in", out: "left-out" },
});
for (var key in MOTION) hasOwnProperty(MOTION, key) && Object.freeze(MOTION[key]);