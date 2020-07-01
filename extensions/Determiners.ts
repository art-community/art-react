import {Widget} from "../widgets/Widget";

export function isJsx(value: any): value is JSX.Element {
    return (value as JSX.Element).props != undefined && (value as JSX.Element).type != undefined;
}

export function isWidget(value: any): value is Widget<any> {
    return value instanceof Widget;
}

export function isString(value: any): value is string {
    return typeof value === "string";
}

export function isNumber(value: any): value is number {
    return typeof value === "number";
}

export function isObject(value: any): value is object {
    return typeof value === "object";
}

export function isUndefined(value: any): value is undefined {
    return value == undefined;
}

export function isBool(value: any): value is boolean {
    return typeof value === "boolean";
}

export function isArray<T>(value: any) : value is Array<T> {
    return Array.isArray(value)
}
