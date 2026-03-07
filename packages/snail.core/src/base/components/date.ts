/**
 * Date 相关扩展
 */

import { getType } from "../utils/type-utils";

//#region *************************************        判断校验        *************************************
/**
 * 是否是Date
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isDate(data: any): boolean {
    return getType(data) == "[object Date]";
}
//#endregion

//#region *************************************        格式美化        *************************************
//#endregion

//#region *************************************        操作扩展        *************************************
//#endregion