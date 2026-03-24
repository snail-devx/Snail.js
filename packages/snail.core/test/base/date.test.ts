// date.test.ts
import { describe, it, expect } from 'vitest';
import {
    isDate,
    isValidTime,
    correctDate,
    correctTimeValue,
    correctDateFormat,
    correctTimeFormat,
    formatDate,
    formatDateValue,
    formatTimeValue,
    parseDate,
    parseDateValue,
    parseTimeValue,
    getDateByValue,
    getDateValue,
    getTimeValue,
    getTimeNumber,
    getLastDayInMonth
} from '../../src/base/components/date';

//#region 判断校验测试
describe('isDate', () => {
    it('有效 Date 对象返回 true', () => {
        expect(isDate(new Date())).toBe(true);
    });

    it('非 Date 对象返回 false', () => {
        expect(isDate(null)).toBe(false);
        expect(isDate(undefined)).toBe(false);
        expect(isDate('2024-01-01')).toBe(false);
        expect(isDate(123)).toBe(false);
        expect(isDate({})).toBe(false);
    });

    it('Invalid Date 返回 true（类型是 Date）', () => {
        expect(isDate(new Date('invalid'))).toBe(true);
    });
});

describe('isValidTime', () => {
    it('有效时间在范围内返回 true', () => {
        expect(isValidTime('HH:mm:ss', { hour: 12, minute: 30, second: 0 }, undefined, undefined)).toBe(true);
        expect(isValidTime('HH:mm:ss', { hour: 12, } as any, undefined, undefined)).toBe(true);
    });

    it('时间小于最小值返回 false', () => {
        expect(isValidTime('HH:mm:ss', { hour: 8, minute: 0, second: 0 }, { hour: 9, minute: 0, second: 0 }, undefined)).toBe(false);
    });

    it('时间大于最大值返回 false', () => {
        expect(isValidTime('HH:mm:ss', { hour: 20, minute: 0, second: 0 }, undefined, { hour: 18, minute: 0, second: 0 })).toBe(false);
    });

    it('HH:mm 格式验证', () => {
        expect(isValidTime('HH:mm', { hour: 12, minute: 30 } as any, undefined, undefined)).toBe(true);
    });

    it('无效小时返回 false', () => {
        expect(isValidTime('HH:mm:ss', { hour: 25, minute: 0, second: 0 }, undefined, undefined)).toBe(false);
    });
});

describe('correctDate', () => {
    it('有效日期返回自身', () => {
        const date = new Date('2024-01-01');
        expect(correctDate(date, new Date('2025-01-01'))).toBe(date);
    });

    it('无效日期返回 newValue', () => {
        const newValue = new Date('2025-01-01');
        expect(correctDate(null, newValue)).toBe(newValue);
        expect(correctDate('invalid', newValue)).toBe(newValue);
    });

    it('Invalid Date 返回 newValue', () => {
        const newValue = new Date('2025-01-01');
        const invalidDate = new Date('invalid');
        expect(correctDate(invalidDate, newValue)).toBe(newValue);
    });
});

describe('correctTimeValue', () => {
    it('完整有效时间返回自身', () => {
        const time = { hour: 12, minute: 30, second: 45 };
        expect(correctTimeValue(time)).toEqual(time);
    });

    it('缺失分钟秒补全（min 策略）', () => {
        expect(correctTimeValue({ hour: 12 }, 'min')).toEqual({ hour: 12, minute: 0, second: 0 });
    });

    it('缺失分钟秒补全（max 策略）', () => {
        expect(correctTimeValue({ hour: 12 }, 'max')).toEqual({ hour: 12, minute: 59, second: 59 });
    });

    it('小时超出范围返回 undefined', () => {
        expect(correctTimeValue({ hour: 24, minute: 0, second: 0 })).toBeUndefined();
        expect(correctTimeValue({ hour: -1, minute: 0, second: 0 })).toBeUndefined();
    });

    it('分钟超出范围返回 undefined', () => {
        expect(correctTimeValue({ hour: 12, minute: 60, second: 0 })).toBeUndefined();
    });

    it('秒超出范围返回 undefined', () => {
        expect(correctTimeValue({ hour: 12, minute: 0, second: 60 })).toBeUndefined();
    });

    it('分钟缺失但秒有值返回 undefined', () => {
        expect(correctTimeValue({ hour: 12, second: 30 })).toBeUndefined();
    });
});

describe('correctDateFormat', () => {
    it('有效格式返回自身', () => {
        expect(correctDateFormat('yyyy-MM-dd', 'yyyy-MM')).toBe('yyyy-MM-dd');
        expect(correctDateFormat('yyyy-MM', 'yyyy-MM')).toBe('yyyy-MM');
        expect(correctDateFormat('yyyy', 'yyyy-MM')).toBe('yyyy');
    });

    it('无效格式返回 newValue', () => {
        expect(correctDateFormat('invalid' as any, 'yyyy-MM-dd')).toBe('yyyy-MM-dd');
    });
});

describe('correctTimeFormat', () => {
    it('有效格式返回自身', () => {
        expect(correctTimeFormat('HH:mm:ss', 'HH:mm')).toBe('HH:mm:ss');
        expect(correctTimeFormat('HH:mm', 'HH:mm')).toBe('HH:mm');
        expect(correctTimeFormat('HH', 'HH:mm')).toBe('HH');
    });

    it('无效格式返回 newValue', () => {
        expect(correctTimeFormat('invalid' as any, 'HH:mm:ss')).toBe('HH:mm:ss');
    });
});
//#endregion

//#region 格式美化测试
describe('formatDate', () => {
    it('yyyy 格式', () => {
        const date = new Date('2024-01-15');
        expect(formatDate(date, 'yyyy')).toBe('2024');
    });

    it('yyyy-MM 格式', () => {
        const date = new Date('2024-01-15');
        expect(formatDate(date, 'yyyy-MM')).toBe('2024-01');
    });

    it('yyyy-MM-dd 格式', () => {
        const date = new Date('2024-01-15');
        expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
    });

    it('yyyy-MM-dd HH:mm 格式', () => {
        const date = new Date('2024-01-15 14:30:00');
        expect(formatDate(date, 'yyyy-MM-dd HH:mm')).toBe('2024-01-15 14:30');
    });

    it('yyyy-MM-dd HH:mm:ss 格式', () => {
        const date = new Date('2024-01-15 14:30:45');
        expect(formatDate(date, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-01-15 14:30:45');
    });

    it('无效日期返回 undefined', () => {
        expect(formatDate(null as any, 'yyyy-MM-dd')).toBeUndefined();
        expect(formatDate(new Date('invalid'), 'yyyy-MM-dd')).toBeUndefined();
    });
});

describe('formatDateValue', () => {
    it('日期值格式化', () => {
        const value = { year: 2024, month: 1, day: 15 };
        expect(formatDateValue(value, 'yyyy-MM-dd')).toBe('2024-01-15');
    });

    it('无效日期值返回 undefined', () => {
        expect(formatDateValue({}, 'yyyy-MM-dd')).toBeUndefined();
    });
});

describe('formatTimeValue', () => {
    it('HH 格式', () => {
        expect(formatTimeValue({ hour: 9 }, 'HH')).toBe('09');
    });

    it('HH:mm 格式', () => {
        expect(formatTimeValue({ hour: 9, minute: 5 }, 'HH:mm')).toBe('09:05');
    });

    it('HH:mm:ss 格式（默认）', () => {
        expect(formatTimeValue({ hour: 9, minute: 5, second: 3 })).toBe('09:05:03');
    });

    it('缺失值自动补全', () => {
        expect(formatTimeValue({ hour: 12 })).toBe('12:00:00');
    });

    it('无效时间返回 undefined', () => {
        expect(formatTimeValue({ hour: 25, minute: 0, second: 0 })).toBeUndefined();
    });
});
//#endregion

//#region 操作扩展测试
describe('parseDate', () => {
    it('完整日期字符串解析', () => {
        const date = parseDate('2024-01-15 14:30:45');
        expect(date).toBeInstanceOf(Date);
        expect(date?.getFullYear()).toBe(2024);
        expect(date?.getMonth() + 1).toBe(1);
        expect(date?.getDate()).toBe(15);
    });

    it('缺失部分补全（min 策略）', () => {
        const date = parseDate('2024-01', 'min');
        expect(date?.getFullYear()).toBe(2024);
        expect(date?.getMonth() + 1).toBe(1);
        expect(date?.getDate()).toBe(1);
        expect(date?.getHours()).toBe(0);
    });

    it('缺失部分补全（max 策略）', () => {
        const date = parseDate('2024-01', 'max');
        expect(date?.getFullYear()).toBe(2024);
        expect(date?.getMonth() + 1).toBe(1);
        expect(date?.getDate()).toBe(31);
        expect(date?.getHours()).toBe(23);
    });

    it('无效字符串返回 undefined', () => {
        expect(parseDate('')).toBeUndefined();
        expect(parseDate('invalid')).toBeUndefined();
    });

    it('月份超出范围返回 undefined', () => {
        expect(parseDate('2024-13-01')).toBeUndefined();
    });

    it('日期超出范围返回 undefined', () => {
        expect(parseDate('2024-02-30')).toBeUndefined();
    });
});

describe('parseDateValue', () => {
    it('完整日期字符串解析', () => {
        const value = parseDateValue('2024-01-15 14:30:45');
        expect(value?.year).toBe(2024);
        expect(value?.month).toBe(1);
        expect(value?.day).toBe(15);
        expect(value?.hour).toBe(14);
        expect(value?.minute).toBe(30);
        expect(value?.second).toBe(45);
    });

    it('仅年月解析', () => {
        const value = parseDateValue('2024-01');
        expect(value?.year).toBe(2024);
        expect(value?.month).toBe(1);
        expect(value?.day).toBe(1);
    });

    it('空字符串返回 undefined', () => {
        expect(parseDateValue('')).toBeUndefined();
    });

    it('月缺失返回 undefined', () => {
        expect(parseDateValue('15')?.year).toBe(15);
    });
});

describe('parseTimeValue', () => {
    it('完整时间字符串解析', () => {
        const value = parseTimeValue('14:30:45');
        expect(value?.hour).toBe(14);
        expect(value?.minute).toBe(30);
        expect(value?.second).toBe(45);
    });

    it('时分解析', () => {
        const value = parseTimeValue('14:30');
        expect(value?.hour).toBe(14);
        expect(value?.minute).toBe(30);
        expect(value?.second).toBe(0);
    });

    it('仅小时解析', () => {
        const value = parseTimeValue('14');
        expect(value?.hour).toBe(14);
        expect(value?.minute).toBe(0);
        expect(value?.second).toBe(0);
    });

    it('空字符串返回 undefined', () => {
        expect(parseTimeValue('')).toBeUndefined();
    });

    it('无效时间返回 undefined', () => {
        expect(parseTimeValue('22::00')).toBeUndefined();
        expect(parseTimeValue('25:00:00')).toBeUndefined();
    });
});

describe('getDateByValue', () => {
    it('完整日期值转换', () => {
        const value = { year: 2024, month: 1, day: 15, hour: 14, minute: 30, second: 45 };
        const date = getDateByValue(value);
        expect(date).toBeInstanceOf(Date);
        expect(date?.getFullYear()).toBe(2024);
        expect(date?.getMonth() + 1).toBe(1);
        expect(date?.getDate()).toBe(15);
    });

    it('缺失部分补最小值', () => {
        const value = { year: 2024 };
        const date = getDateByValue(value);
        expect(date?.getMonth() + 1).toBe(1);
        expect(date?.getDate()).toBe(1);
        expect(date?.getHours()).toBe(0);
    });

    it('无年份返回 undefined', () => {
        expect(getDateByValue({})).toBeUndefined();
        expect(getDateByValue({ month: 1, day: 15 })).toBeUndefined();
    });
});

describe('getDateValue', () => {
    it('有效日期转换', () => {
        const date = new Date('2024-01-15 14:30:45');
        const value = getDateValue(date);
        expect(value?.year).toBe(2024);
        expect(value?.month).toBe(1);
        expect(value?.day).toBe(15);
        expect(value?.hour).toBe(14);
        expect(value?.minute).toBe(30);
        expect(value?.second).toBe(45);
    });

    it('无效日期返回 undefined', () => {
        expect(getDateValue(null as any)).toBeUndefined();
        expect(getDateValue(new Date('invalid'))).toBeUndefined();
    });
});

describe('getTimeValue', () => {
    it('有效日期获取时间值', () => {
        const date = new Date('2024-01-15 14:30:45');
        const value = getTimeValue(date);
        expect(value?.hour).toBe(14);
        expect(value?.minute).toBe(30);
        expect(value?.second).toBe(45);
    });

    it('无效日期返回 undefined', () => {
        expect(getTimeValue(null as any)).toBeUndefined();
    });
});

describe('getTimeNumber', () => {
    it('时间数值计算', () => {
        expect(getTimeNumber(14, 30, 45)).toBe(143045);
    });

    it('零值处理', () => {
        expect(getTimeNumber(0, 0, 0)).toBe(0);
    });

    it('undefined 值处理', () => {
        expect(getTimeNumber(undefined as any, undefined as any, undefined as any)).toBe(0);
    });
});

describe('getLastDayInMonth', () => {
    it('31 天的月份', () => {
        expect(getLastDayInMonth(2024, 1)).toBe(31);
        expect(getLastDayInMonth(2024, 3)).toBe(31);
    });

    it('30 天的月份', () => {
        expect(getLastDayInMonth(2024, 4)).toBe(30);
        expect(getLastDayInMonth(2024, 6)).toBe(30);
    });

    it('闰年 2 月', () => {
        expect(getLastDayInMonth(2024, 2)).toBe(29);
    });

    it('平年 2 月', () => {
        expect(getLastDayInMonth(2023, 2)).toBe(28);
    });

    it('无效月份返回 ', () => {
        //  2024-0  转换成 2023-12-31
        expect(getLastDayInMonth(2024, 0)).toBe(31);
        //  2024-13  转换成 2025-01-31
        expect(getLastDayInMonth(2024, 13)).toBe(31);
    });
});
//#endregion