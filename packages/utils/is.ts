const toString = Object.prototype.toString;

export function is(val: unknown, type: string): boolean {
  return toString.call(val) === `[object ${type}]`;
}

export function isDef<T = unknown>(val?: T): val is T {
  return typeof val !== "undefined";
}

export function isUnDef<T = unknown>(val?: T): val is T {
  return !isDef(val);
}

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && is(val, "Object");
}

export function isDate(val: unknown): val is Date {
  return is(val, "Date");
}

export function isNull(val: unknown): val is null {
  return val === null;
}

export function isNullAndUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) && isNull(val);
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val);
}

export function isNumber(val: unknown): val is number {
  return is(val, "Number");
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return is(val, "Promise") && isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

export function isString(val: unknown): val is string {
  return is(val, "String");
}

export function isFunction(val: unknown): val is () => unknown {
  return typeof val === "function";
}

export function isBoolean(val: unknown): val is boolean {
  return is(val, "Boolean");
}

export function isRegExp(val: unknown): val is RegExp {
  return is(val, "RegExp");
}

export function isArray(val: unknown): boolean {
  return Array.isArray(val);
}

export function isWindow(val: unknown): val is Window {
  return typeof window !== "undefined" && is(val, "Window");
}

export function isElement(val: unknown): val is Element {
  return isObject(val) && !!val.tagName;
}

export function isMap(val: unknown): val is Map<any, any> {
  return is(val, "Map");
}
export function isEmptyObject<T = unknown>(val: T): val is T {
  if (isObject(val)) {
    return Object.keys(val).length === 0;
  }
  return false;
}
