const isArray = o => ({}.toString.apply(o) === "[object Array]"),

      isObject = o => ({}.toString.apply(o) === "[object Object]"),

      isFunction = o => ({}.toString.apply(o) === "[object Function]"),

      isString = o => typeof o === "string",

      isBoolean = o => typeof o === "boolean",

      isUndefined = o => typeof o === "undefined";

export {
  isArray,
  isObject,
  isFunction,
  isString,
  isBoolean,
  isUndefined
};