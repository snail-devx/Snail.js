import { assert, describe, expect, test } from 'vitest'
import {
    drill, extract, hasAny, hasOwnProperty,
    getType, isString, isStringNotEmpty, isArray, isArrayNotEmpty, isBoolean, isDate, isFalsey, isFunction, isNumber, isNumberNotNaN,
    isUndefined, isNull, isNullOrUndefined, isObject, isPromise, isRegexp, isWindow,
    newId, tidyFunction, tidyString,
    mustArray, mustFunction, mustString, mustObject
} from "../../src/base/data"

//  getType、isXX测试
describe("getType、isXX", () => {
    [
        //  无效值
        { src: null, getType: "[object Null]", isNull: true, isNullOrUndefined: true, isFalsey: true },
        { src: undefined, getType: "[object Undefined]", isUndefined: true, isNullOrUndefined: true, isFalsey: true },
        //  object
        { src: {}, getType: "[object Object]", isObject: true },
        { src: new Object(), getType: "[object Object]", isObject: true },
        { src: Object.create(null), getType: "[object Object]", isObject: true },
        //  function
        { src: () => { }, getType: "[object Function]", isFunction: true },
        { src: function () { }, getType: "[object Function]", isFunction: true },
        { src: new Function(), getType: "[object Function]", isFunction: true },
        //  数组
        { src: [], getType: "[object Array]", isArray: true },
        { src: new Array(), getType: "[object Array]", isArray: true },
        { src: [1], getType: "[object Array]", isArray: true, isArrayNotEmpty: true },
        { src: [null], getType: "[object Array]", isArray: true, isArrayNotEmpty: true },
        //  布尔值
        { src: true, getType: "[object Boolean]", isBoolean: true, },
        { src: false, getType: "[object Boolean]", isBoolean: true, isFalsey: true },
        //  数值
        { src: NaN, getType: "[object Number]", isNumber: true, isFalsey: true },
        { src: 1, getType: "[object Number]", isNumber: true, isNumberNotNaN: true },
        { src: 1.1, getType: "[object Number]", isNumber: true, isNumberNotNaN: true },
        { src: 0, getType: "[object Number]", isNumber: true, isNumberNotNaN: true, isFalsey: true },
        { src: -1, getType: "[object Number]", isNumber: true, isNumberNotNaN: true },
        { src: -1.1, getType: "[object Number]", isNumber: true, isNumberNotNaN: true },
        //  string
        { src: "", getType: "[object String]", isString: true, isFalsey: true },
        { src: "0", getType: "[object String]", isString: true, isFalsey: true, isStringNotEmpty: true },
        { src: "1", getType: "[object String]", isString: true, isStringNotEmpty: true },
        { src: "迭代", getType: "[object String]", isString: true, isStringNotEmpty: true },
        { src: 'c', getType: "[object String]", isString: true, isStringNotEmpty: true },
        { src: new String(), getType: "[object String]", isString: true },
        { src: new String(111), getType: "[object String]", isString: true, isStringNotEmpty: true },
        { src: String(null), getType: "[object String]", isString: true, isStringNotEmpty: true },
        { src: String(undefined), getType: "[object String]", isString: true, isStringNotEmpty: true },
        // Date
        { src: new Date(), getType: "[object Date]", isDate: true },
        // isRegexp
        { src: / /, getType: "[object RegExp]", isRegexp: true },
        { src: / /gi, getType: "[object RegExp]", isRegexp: true },
        { src: new RegExp(""), getType: "[object RegExp]", isRegexp: true },
        { src: new RegExp("."), getType: "[object RegExp]", isRegexp: true },
        //  Promise
        { src: new Promise(() => { }), getType: "[object Promise]", isPromise: true },
    ].forEach(item => {
        [
            getType,
            isNull,
            isUndefined,
            isNullOrUndefined,
            isObject,
            isFunction,
            isArray,
            isArrayNotEmpty,
            isBoolean,
            isNumber,
            isNumberNotNaN,
            isString,
            isStringNotEmpty,
            isDate,
            isRegexp,
            isPromise,
            isWindow,
            isFalsey
        ].forEach(func => {
            const funcName = func.name;
            test(funcName, () => {
                const wantValue = hasOwnProperty(item, funcName) ? item[funcName] : false;
                expect(func(item.src), `${funcName}:${JSON.stringify(item)}`).toBe(wantValue);
            });
        });
    });
});

describe("hasXXX", () => {
    test("hasOwnProperty", () => {
        expect(hasOwnProperty(undefined, "key")).toBe(false);
        expect(hasOwnProperty(null, "key")).toBe(false);
        expect(hasOwnProperty({}, "key")).toBe(false);
        expect(hasOwnProperty({ key: undefined }, "key")).toBe(true);
        expect(hasOwnProperty({ key: null }, "key")).toBe(true);
        expect(hasOwnProperty({ key: 11 }, "key")).toBe(true);
        expect(hasOwnProperty({ key: 11 }, "toString")).toBe(false);
    });
    test("hasAny", () => {
        expect(hasAny("")).toBe(false);
        expect(hasAny(undefined)).toBe(false);
        expect(hasAny(null)).toBe(false);
        expect(hasAny([])).toBe(false);
        expect(hasAny("0")).toBe(true);
        expect(hasAny("1")).toBe(true);
        expect(hasAny(" ")).toBe(true);
        expect(hasAny([1])).toBe(true);
    });
});

describe("mustXXX", () => {
    test("mustString", () => {
        expect(() => mustString(undefined, "str")).toThrowError("str must be a non-empty string.")
        expect(() => mustString(null, "str1")).toThrowError("str1 must be a non-empty string.")
        expect(() => mustString({}, "str2")).toThrowError("str2 must be a non-empty string.")
        expect(() => mustString("", "str3")).toThrowError("str3 must be a non-empty string.")
        expect(mustString("11", "str3")).toBe(true);
        expect(mustString(" ", "str4")).toBe(true);
    });
    test("mustArray", () => {
        expect(() => mustArray(undefined, "arr")).toThrowError("arr must be a non-empty array.")
        expect(() => mustArray(null, "arr1")).toThrowError("arr1 must be a non-empty array.")
        expect(() => mustArray({}, "arr1")).toThrowError("arr1 must be a non-empty array.")
        expect(() => mustArray("", "arr3")).toThrowError("arr3 must be a non-empty array.")
        expect(() => mustArray([], "arr4")).toThrowError("arr4 must be a non-empty array.");
        expect(mustArray([1], "arr5")).toBe(true);
        expect(mustArray([1, 2], "arr5")).toBe(true);
        expect(mustArray([undefined], "arr5")).toBe(true);
        expect(mustArray([undefined, null, {}], "arr5")).toBe(true);
    });
    test("mustFunction", () => {
        expect(() => mustFunction(undefined, "func1")).toThrowError("func1 must be a function")
        expect(() => mustFunction(null, "funcx")).toThrowError("funcx must be a function")
        expect(() => mustFunction({}, "funcx")).toThrowError("funcx must be a function")
        expect(() => mustFunction("", "func3")).toThrowError("func3 must be a function")
        expect(mustFunction(() => { }, "")).toBe(true);
        expect(mustFunction(function () { }, "")).toBe(true);
        expect(mustFunction(new Function(), "")).toBe(true);
    });
    test("mustObject", () => {
        expect(() => mustObject(undefined, "obj1")).toThrowError("obj1 must be an object")
        expect(() => mustObject(null, "objx")).toThrowError("objx must be an object")
        expect(() => mustObject(Date.now(), "objx")).toThrowError("objx must be an object")
        expect(() => mustObject("", "obj3")).toThrowError("obj3 must be an object")
        expect(() => mustObject([], "obj3")).toThrowError("obj3 must be an object")
        expect(() => mustObject(/1/g, "obj3")).toThrowError("obj3 must be an object")
        expect(() => mustObject(new Map(), "obj3")).toThrowError("obj3 must be an object")
        expect(mustObject({}, "3")).toBe(true);
        expect(mustObject(Object.create(null), "4")).toBe(true);
    });
});


describe("tidyXXX", () => {
    test("tidyString", () => {
        expect(tidyString(null)).toBe(undefined);
        expect(tidyString(undefined)).toBe(undefined);
        expect(tidyString(1)).toBe(undefined);
        expect(tidyString(NaN)).toBe(undefined);
        expect(tidyString({})).toBe(undefined);
        expect(tidyString(new Object)).toBe(undefined);
        expect(tidyString(function () { })).toBe(undefined);
        expect(tidyString("")).toBe(undefined);
        expect(tidyString("111")).toBe("111");
    });

    test("tidyFunction", () => {
        expect(tidyFunction("")).toBe(undefined);
        expect(tidyFunction(null)).toBe(undefined);
        expect(tidyFunction(undefined)).toBe(undefined);
        expect(tidyFunction(1)).toBe(undefined);
        expect(tidyFunction(function () { }));
    });
});

describe("newId", () => {
    test("", () => {
        const id = newId();
        assert.isTrue(id.length > 0);
    });
    const x = Object.create(null);
    const tmpFunc = () => {
        const str = newId();
        hasOwnProperty(x, str) && assert.fail(`存在重复id值:${str}`);
        x[str] = 1;
    }
    test("1", tmpFunc);
    test("2", tmpFunc);
    test("3", tmpFunc);
    test("4", tmpFunc);
    test("5", tmpFunc);
    test("loop", () => {
        for (let index = 0; index < 10000; index++) {
            tmpFunc();
        }
    })
})
test("drill", () => {
    expect(drill.call(undefined)).toBeUndefined();
    expect(drill(1)).toBe(1);
    expect(drill({}, ["1", "2"])).toBeUndefined();
    expect(drill(undefined, ["1", "2"])).toBeUndefined();
    expect(drill({ "toBen": "11" }, ["toBen"])).toBe("11");
    expect(drill({ "toBen": undefined }, ["toBen"])).toBeUndefined();
    expect(drill({ "toBen": { drilling: 33 } }, ["toBen", "drilling"])).toBe(33);
    expect(drill({ "toBen": {} }, ["toBen", "drilling"])).toBe(undefined);
});
test("extract", () => {
    expect(extract([])).toMatchObject({});
    expect(extract(["1", "2"], undefined)).toMatchObject({});
    expect(extract([], {})).toMatchObject({});
    expect(extract(["1", "2"], {})).toMatchObject({});
    expect(extract(["1", "2"], {})).toMatchObject({});
    expect(extract(["1", "2"], { 1: "123" })).toMatchObject({ 1: "123" });
});