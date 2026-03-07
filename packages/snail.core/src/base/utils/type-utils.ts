/**
 * 类型助手方法
 */

/**
 * 获取传入数据的类型
 * @param data 
 * @returns 具体的数据类型，如[object Object]、[object String]
 */
export function getType(data: any): string {
    return Object.prototype.toString.call(data);
}

//#region *************************************        暂时没独立components封装的函数        ******************

//#endregion