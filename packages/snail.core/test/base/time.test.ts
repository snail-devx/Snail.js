/**
 * 时间 处理相关测试，基于千问自动生成后修正
 */

import { assert, describe, expect, test, it } from 'vitest';
import { parseTimeValue, correctTimeValue, useTimeValue } from '../../src/base';
import type { TimeValue, TimeValueManagerOptions } from '../../src/base';

describe('parseTime', () => {
    it('应正确解析完整时间格式 HH:mm:ss', () => {
        const result = parseTimeValue('12:30:45');
        expect(result).toEqual({ hour: 12, minute: 30, second: 45 });
    });

    it('应正确解析只有小时和分钟的时间格式 HH:mm', () => {
        const result = parseTimeValue('12:30');
        expect(result).toEqual({ hour: 12, minute: 30, second: undefined });
    });

    it('应正确解析只有小时的时间格式 HH', () => {
        const result = parseTimeValue('12');
        expect(result).toEqual({ hour: 12, minute: undefined, second: undefined });
    });

    it('空字符串应返回 undefined', () => {
        const result = parseTimeValue('');
        expect(result).toBeUndefined();
    });

    it('undefined 应返回 undefined', () => {
        const result = parseTimeValue(undefined as any);
        expect(result).toBeUndefined();
    });

    it('无效字符串应返回 undefined', () => {
        const result = parseTimeValue('abc');
        expect(result).toBeUndefined();
    });

    it('超出范围的小时应返回 undefined', () => {
        const result = parseTimeValue('25:30:45');
        expect(result).toBeUndefined();
    });

    it('超出范围的分钟应返回 undefined', () => {
        const result = parseTimeValue('12:60:45');
        expect(result).toBeUndefined();
    });

    it('超出范围的秒应返回 undefined', () => {
        const result = parseTimeValue('12:30:60');
        expect(result).toBeUndefined();
    });

    it('负数小时应返回 undefined', () => {
        const result = parseTimeValue('-1:30:45');
        expect(result).toBeUndefined();
    });

    it('边界值 0:0:0 应有效', () => {
        const result = parseTimeValue('0:0:0');
        expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
    });

    it('边界值 23:59:59 应有效', () => {
        const result = parseTimeValue('23:59:59');
        expect(result).toEqual({ hour: 23, minute: 59, second: 59 });
    });

    it('分钟为 undefined 时秒应强制为 undefined', () => {
        const result = parseTimeValue('12');
        expect(result).toEqual({ hour: 12, minute: undefined, second: undefined });
    });
});

describe('correctTime', () => {
    it('应通过有效时间值', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 45 };
        const result = correctTimeValue(time);
        expect(result).toEqual({ hour: 12, minute: 30, second: 45 });
    });

    it('小时超出范围应返回 undefined', () => {
        const time: TimeValue = { hour: 24, minute: 30, second: 45 };
        const result = correctTimeValue(time);
        expect(result).toBeUndefined();
    });

    it('分钟超出范围应返回 undefined', () => {
        const time: TimeValue = { hour: 12, minute: 60, second: 45 };
        const result = correctTimeValue(time);
        expect(result).toBeUndefined();
    });

    it('秒超出范围应返回 undefined', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 60 };
        const result = correctTimeValue(time);
        expect(result).toBeUndefined();
    });

    it('负数小时应返回 undefined', () => {
        const time: TimeValue = { hour: -1, minute: 30, second: 45 };
        const result = correctTimeValue(time);
        expect(result).toBeUndefined();
    });

    it('负数分钟应返回 undefined', () => {
        const time: TimeValue = { hour: 12, minute: -1, second: 45 };
        const result = correctTimeValue(time);
        expect(result).toBeUndefined();
    });

    it('负数秒应返回 undefined', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: -1 };
        const result = correctTimeValue(time);
        expect(result).toBeUndefined();
    });

    it('undefined 输入应返回 undefined', () => {
        const result = correctTimeValue(undefined as any);
        expect(result).toBeUndefined();
    });

    it('边界值 0:0:0 应有效', () => {
        const time: TimeValue = { hour: 0, minute: 0, second: 0 };
        const result = correctTimeValue(time);
        expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
    });

    it('边界值 23:59:59 应有效', () => {
        const time: TimeValue = { hour: 23, minute: 59, second: 59 };
        const result = correctTimeValue(time);
        expect(result).toEqual({ hour: 23, minute: 59, second: 59 });
    });

    it('分钟为 undefined 时秒应强制为 undefined', () => {
        const time: TimeValue = { hour: 12, minute: undefined, second: 45 };
        const result = correctTimeValue(time);
        expect(result).toEqual({ hour: 12, minute: undefined, second: undefined });
    });

    it('小时为 undefined 应返回 undefined', () => {
        const time: TimeValue = { hour: undefined, minute: 30, second: 45 };
        const result = correctTimeValue(time);
        expect(result).toBeUndefined();
    });
});

describe('useTime   默认配置 (HH:mm:ss)', () => {
    const manager = useTimeValue();

    it('parse 应解析并校正有效时间', () => {
        const result = manager.parse('12:30:45');
        expect(result).toEqual({ hour: 12, minute: 30, second: 45 });
    });

    it('parse 无效输入应返回 undefined', () => {
        const result = manager.parse('invalid');
        expect(result).toBeUndefined();
    });

    it('parse undefined 应返回 undefined', () => {
        const result = manager.parse(undefined);
        expect(result).toBeUndefined();
    });

    it('correct 应根据格式补全缺失部分', () => {
        const time: TimeValue = { hour: 12, minute: undefined, second: undefined };
        const result = manager.correct(time);
        expect(result?.hour).toBe(12);
        expect(result?.minute).toBe(0);
        expect(result?.second).toBe(0);
    });

    it('correct 无效时间应返回 undefined', () => {
        const time: TimeValue = { hour: 25, minute: 30, second: 45 };
        const result = manager.correct(time);
        expect(result).toBeUndefined();
    });

    it('correct 小时为 undefined 应返回 undefined', () => {
        const time: TimeValue = { hour: undefined, minute: 30, second: 45 };
        const result = manager.correct(time);
        expect(result).toBeUndefined();
    });

    it('toNumber 应正确转换有效时间值', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 45 };
        const result = manager.toNumber(time);
        expect(result).toBe(123045);
    });

    it('toNumber 无效时间应返回 undefined', () => {
        const time: TimeValue = { hour: 25, minute: 30, second: 45 };
        const result = manager.toNumber(time);
        expect(result).toBeUndefined();
    });

    it('toNumber 缺失部分应使用 0 补全', () => {
        const time: TimeValue = { hour: 12, minute: undefined, second: undefined };
        const result = manager.toNumber(time);
        expect(result).toBe(120000);
    });

    it('toString 应格式化有效时间字符串', () => {
        const time: TimeValue = { hour: 12, minute: 5, second: 3 };
        const result = manager.toString(time);
        expect(result).toBe('12:05:03');
    });

    it('toString 无效时间应返回 undefined', () => {
        const time: TimeValue = { hour: 25, minute: 30, second: 45 };
        const result = manager.toString(time);
        expect(result).toBeUndefined();
    });

    it('toString 应补全前导零', () => {
        const time: TimeValue = { hour: 1, minute: 2, second: 3 };
        const result = manager.toString(time);
        expect(result).toBe('01:02:03');
    });

    it('validate 应验证有效时间', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 45 };
        expect(manager.validate(time)).toBe(true);
    });

    it('validate 应拒绝无效时间', () => {
        const time: TimeValue = { hour: 25, minute: 30, second: 45 };
        expect(manager.validate(time)).toBe(false);
    });

    it('validate 小时为 undefined 应返回 false', () => {
        const time: TimeValue = { hour: undefined, minute: 30, second: 45 };
        expect(manager.validate(time)).toBe(false);
    });
});

describe('useTime   HH 格式', () => {
    const manager = useTimeValue({ format: 'HH' });

    it('correct 应忽略分钟和秒', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 45 };
        const result = manager.correct(time);
        expect(result?.hour).toBe(12);
        expect(result?.minute).toBeUndefined();
        expect(result?.second).toBeUndefined();
    });

    it('toString 应只输出小时', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 45 };
        const result = manager.toString(time);
        expect(result).toBe('12');
    });

    it('toString 无效时间应返回 undefined', () => {
        const time: TimeValue = { hour: 25, minute: 30, second: 45 };
        const result = manager.toString(time);
        expect(result).toBeUndefined();
    });

    it('validate 仅验证小时', () => {
        expect(manager.validate(undefined)).toBe(false);
        expect(manager.validate({ hour: undefined })).toBe(false);
        expect(manager.validate({ hour: 24 })).toBe(false);
        expect(manager.validate({ hour: 12 })).toBe(true);
    });
    it('validateHH 应验证小时范围', () => {
        expect(manager.validateHH(12)).toBe(true);
        expect(manager.validateHH(24)).toBe(false);
        expect(manager.validateHH(-1)).toBe(false);
        expect(manager.validateHH(undefined as any)).toBe(false);
    });

    it('toNumber 应正确转换', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 45 };
        const result = manager.toNumber(time);
        expect(result).toBe(120000);
    });
});

describe('useTime   HH:mm 格式', () => {
    const manager = useTimeValue({ format: 'HH:mm' });

    it('correct 应忽略秒', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 45 };
        const result = manager.correct(time);
        expect(result?.hour).toBe(12);
        expect(result?.minute).toBe(30);
        expect(result?.second).toBeUndefined();
    });

    it('correct 缺失分钟应补全为 0', () => {
        const time: TimeValue = { hour: 12, minute: undefined, second: 45 };
        const result = manager.correct(time);
        expect(result?.minute).toBe(0);
    });

    it('toString 应输出 HH:mm 格式', () => {
        const time: TimeValue = { hour: 12, minute: 5, second: 45 };
        const result = manager.toString(time);
        expect(result).toBe('12:05');
    });

    it('validate 应验证小时和分钟范围', () => {
        expect(manager.validate({ hour: 12, minute: 30 })).toBe(true);
        expect(manager.validate({ hour: 12, minute: undefined })).toBe(true);
        expect(manager.validate(undefined)).toBe(false);
        expect(manager.validate({ hour: undefined, minute: 60 })).toBe(false);
        expect(manager.validate({ hour: 24, minute: 30 })).toBe(false);
        expect(manager.validate({ hour: 12, minute: 60 })).toBe(false);
    });
    it('validateHHmm 应验证小时和分钟范围', () => {
        expect(manager.validateHHmm(12, 30)).toBe(true);
        expect(manager.validateHHmm(24, 30)).toBe(false);
        expect(manager.validateHHmm(12, 60)).toBe(false);
        expect(manager.validateHHmm(undefined as any, 30)).toBe(false);
    });

    it('toNumber 应正确转换', () => {
        const time: TimeValue = { hour: 12, minute: 30, second: 45 };
        const result = manager.toNumber(time);
        expect(result).toBe(123000);
    });
});

describe('useTime   自定义 min/max 范围', () => {
    const manager = useTimeValue({
        format: 'HH:mm:ss',
        min: { hour: 9, minute: 0, second: 0 },
        max: { hour: 18, minute: 0, second: 0 }
    });

    it('validate 应在自定义范围内验证有效时间', () => {
        const validTime: TimeValue = { hour: 12, minute: 0, second: 0 };
        expect(manager.validate(validTime)).toBe(true);
    });

    it('validate 应拒绝小于最小值的时间', () => {
        const invalidTime: TimeValue = { hour: 8, minute: 0, second: 0 };
        expect(manager.validate(invalidTime)).toBe(false);
    });

    it('validate 应拒绝大于最大值的时间', () => {
        const invalidTime: TimeValue = { hour: 19, minute: 0, second: 0 };
        expect(manager.validate(invalidTime)).toBe(false);
    });

    it('边界值应有效', () => {
        const minTime: TimeValue = { hour: 9, minute: 0, second: 0 };
        const maxTime: TimeValue = { hour: 18, minute: 0, second: 0 };
        expect(manager.validate(minTime)).toBe(true);
        expect(manager.validate(maxTime)).toBe(true);
    });

    it('validateHHmm 应使用自定义范围', () => {
        expect(manager.validateHHmm(12, 0)).toBe(true);
        expect(manager.validateHHmm(8, 0)).toBe(false);
        expect(manager.validateHHmm(19, 0)).toBe(false);
    });

    it('validateHHmmss 应使用自定义范围', () => {
        expect(manager.validateHHmmss(12, 0, 0)).toBe(true);
        expect(manager.validateHHmmss(8, 0, 0)).toBe(false);
        expect(manager.validateHHmmss(19, 0, 0)).toBe(false);
    });
});

describe('useTime   默认配置选项', () => {
    it('未传入 options 应使用默认值', () => {
        const manager = useTimeValue();
        expect(manager.format).toBe('HH:mm:ss');
        expect(manager.min.hour).toBe(0);
        expect(manager.min.minute).toBe(0);
        expect(manager.min.second).toBe(0);
        expect(manager.max.hour).toBe(23);
        expect(manager.max.minute).toBe(59);
        expect(manager.max.second).toBe(59);
    });

    it('部分配置应合并默认值', () => {
        const manager = useTimeValue({ format: 'HH:mm' });
        expect(manager.format).toBe('HH:mm');
        expect(manager.min.hour).toBe(0);
        expect(manager.max.hour).toBe(23);
    });

    it('自定义 min 应使用传入值', () => {
        const manager = useTimeValue({ min: { hour: 8, minute: 0, second: 0 } });
        expect(manager.min.hour).toBe(8);
        expect(manager.min.minute).toBe(0);
        expect(manager.min.second).toBe(0);
    });

    it('自定义 max 应使用传入值', () => {
        const manager = useTimeValue({ max: { hour: 20, minute: 0, second: 0 } });
        expect(manager.max.hour).toBe(20);
        expect(manager.max.minute).toBe(0);
        expect(manager.max.second).toBe(0);
    });
});

describe('useTime   返回值类型检查', () => {
    const manager = useTimeValue();

    it('parse 返回类型应为 TimeValue | undefined', () => {
        const validResult = manager.parse('12:30:45');
        const invalidResult = manager.parse('invalid');
        expect(validResult).toBeDefined();
        expect(invalidResult).toBeUndefined();
    });

    it('correct 返回类型应为 TimeValue | undefined', () => {
        const validResult = manager.correct({ hour: 12, minute: 30, second: 45 });
        const invalidResult = manager.correct({ hour: 25, minute: 30, second: 45 });
        expect(validResult).toBeDefined();
        expect(invalidResult).toBeUndefined();
    });

    it('toNumber 返回类型应为 number | undefined', () => {
        const validResult = manager.toNumber({ hour: 12, minute: 30, second: 45 });
        const invalidResult = manager.toNumber({ hour: 25, minute: 30, second: 45 });
        expect(validResult).toBeDefined();
        expect(invalidResult).toBeUndefined();
    });

    it('toString 返回类型应为 string | undefined', () => {
        const validResult = manager.toString({ hour: 12, minute: 30, second: 45 });
        const invalidResult = manager.toString({ hour: 25, minute: 30, second: 45 });
        expect(validResult).toBeDefined();
        expect(invalidResult).toBeUndefined();
    });
});

describe('useTime   边界情况测试', () => {
    it('应处理 undefined 输入', () => {
        const manager = useTimeValue();
        const result = manager.parse(undefined);
        expect(result).toBeUndefined();
    });

    it('应处理空对象', () => {
        const manager = useTimeValue();
        const time: TimeValue = { hour: undefined, minute: undefined, second: undefined };
        const result = manager.correct(time);
        expect(result).toBeUndefined();
    });

    it('toNumber 应正确处理边界值', () => {
        const manager = useTimeValue();
        expect(manager.toNumber({ hour: 0, minute: 0, second: 0 })).toBe(0);
        expect(manager.toNumber({ hour: 23, minute: 59, second: 59 })).toBe(235959);
        expect(manager.toNumber({ hour: 25, minute: 0, second: 0 })).toBeUndefined();
    });

    it('validateHHmmss 应验证完整时间', () => {
        const manager = useTimeValue();
        expect(manager.validateHHmmss(12, 30, 45)).toBe(true);
        expect(manager.validateHHmmss(24, 30, 45)).toBe(false);
        expect(manager.validateHHmmss(12, 60, 45)).toBe(false);
        expect(manager.validateHHmmss(12, 30, 60)).toBe(false);
    });

    it('应处理 NaN 值', () => {
        const result = parseTimeValue('a:b:c');
        expect(result).toBeUndefined();
    });

    it('应处理多余的分隔符', () => {
        const result = parseTimeValue('12:30:45:99');
        expect(result?.hour).toBe(12);
        expect(result?.minute).toBe(30);
        expect(result?.second).toBe(45);
    });
});

describe('getTimeNumber 内部逻辑验证', () => {
    it('应正确计算时间数值', () => {
        const manager = useTimeValue();
        expect(manager.toNumber({ hour: 1, minute: 2, second: 3 })).toBe(10203);
        expect(manager.toNumber({ hour: 10, minute: 20, second: 30 })).toBe(102030);
        expect(manager.toNumber({ hour: 23, minute: 59, second: 59 })).toBe(235959);
    });

    it('缺失部分应使用 0 计算', () => {
        const manager = useTimeValue();
        expect(manager.toNumber({ hour: 12, minute: undefined, second: undefined })).toBe(120000);
        expect(manager.toNumber({ hour: 12, minute: 30, second: undefined })).toBe(123000);
    });
});