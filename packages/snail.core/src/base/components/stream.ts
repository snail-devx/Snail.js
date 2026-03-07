/**
 * 字节流相关扩展
 * - 字节相关处理
 * - 流相关处理
 */

//#region *************************************        Bytes 字节处理    *************************************
/**
 * 将字节数转换为带单位的字符串 (B, KB, MB, GB, TB, PB)
 * - 将字节数转换为人类可读的文件大小字符串
 * @param  bytes 字节数（必须是非负数）
 * @param decimals  保留小数位数（默认 2 位）
 * @returns  格式化后的字符串，如 "1.23KB", "512B"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    // 边界处理：非数字、NaN、负数
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
        return '0B';
    }
    // 特殊情况：0 字节
    if (bytes === 0) {
        return '0B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const k = 1024; // 使用二进制单位（1 KB = 1024 B）
    // 计算单位索引（使用对数避免循环）
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // 防止越界（最大支持到 YB）
    const index = Math.min(i, units.length - 1);
    // 计算对应单位的数值
    const size = parseFloat((bytes / Math.pow(k, index)).toFixed(decimals));
    return `${size}${units[index]}`;
}
//#endregion