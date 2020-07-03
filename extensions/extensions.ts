import equal from "fast-deep-equal";
import {debounce} from "@material-ui/core";

Set.prototype.toArray = function <T, R>(this: Set<T>, functor?: (value: T | R) => R): R[] {
    return Array.from(this).map(functor || (value => value as unknown as R));
};

Set.prototype.with = function <T>(this: Set<T>, value: T): Set<T> {
    this.add(value);
    return new Set<T>(this);
};

Set.prototype.without = function <T>(this: Set<T>, value: T): Set<T> {
    this.delete(value);
    return new Set<T>(this);
};

Map.prototype.valuesToArray = function <K, V, R>(this: Map<K, V>, functor?: (value: V | R) => R): R[] {
    return Array.from(this.values()).map(functor || (value => value as unknown as R));
};

Map.prototype.toArray = function <K, V, R>(this: Map<K, V>, functor: (key: K, value: V) => R): R[] {
    return Array.from(this.entries()).map(entry => functor(entry[0], entry[1]));
};

Map.prototype.isEmpty = function (this: Map<unknown, unknown>): boolean {
    return this.size == 0;
};

Map.prototype.some = function <K, V, R>(this: Map<K, V>, functor: (key: K, value: V) => boolean): boolean {
    return Array.from(this.entries()).some(entry => functor(entry[0], entry[1]));
};

Map.prototype.filterEntries = function <K, V>(this: Map<K, V>, functor: (key: K, value: V) => boolean): Map<K, V> {
    return new Map(Array.from(this.entries()).filter(entry => functor(entry[0], entry[1])));
};

Map.prototype.filterValues = function <K, V>(this: Map<K, V>, functor: (value: V) => boolean): Map<K, V> {
    return new Map(Array.from(this.entries()).filter(entry => functor(entry[1])));
};

Map.prototype.filterKeys = function <K, V>(this: Map<K, V>, functor: (value: K) => boolean): Map<K, V> {
    return new Map(Array.from(this.entries()).filter(entry => functor(entry[0])));
};

Map.prototype.without = function <K, V>(this: Map<K, V>, key: K): Map<K, V> {
    this.delete(key);
    return new Map<K, V>(this);
};

Map.prototype.with = function <K, V>(this: Map<K, V>, key: K, value: V): Map<K, V> {
    this.set(key, value);
    return new Map<K, V>(this);
};


Array.prototype.groupBy = function <K, T>(this: Array<T>, functor: (element: T) => K): Map<K, T> {
    const map = new Map<K, T>();
    this.forEach(item => map.set(functor(item), item));
    return map;
};

Array.prototype.groupByMany = function <K, T>(this: Array<T>, functor: (element: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    this.forEach(item => {
        const key = functor(item);
        if (map.has(key)) {
            map.get(key)!.push(item);
            return
        }
        map.set(key, [item])
    });
    return map;
};

Array.prototype.hasDuplicates = function <K, T>(this: Array<T>, functor?: (element: T | K) => K): boolean {
    return new Set(this.map(functor || (element => element as unknown as K))).size != this.length
};

Array.prototype.duplicates = function <K, T>(this: Array<T>, functor?: (element: T | K) => K): T[] {
    const filtered = new Set(this.map(functor || (element => element as unknown as K))).toArray(element => element);
    if (filtered.length == this.length) {
        return []
    }
    return this.filter(element => filtered.includes((functor || (element => element as unknown as K))(element)))
};

Array.prototype.unique = function <K, T>(this: Array<T>, functor?: (element: T | K) => K): T[] {
    const map = new Map<K, T>();
    this.forEach(element => map.set(functor ? functor(element) : element as unknown as K, element));
    return map.valuesToArray(element => element);
};

Array.prototype.has = function <K, T>(this: Array<T>, element: T): boolean {
    return this.some(current => equal(current, element));
};

Array.prototype.toMap = function <K, V, T>(this: Array<T>, functor: (element: T, index: number) => [K, V]): Map<K, V> {
    const map = new Map<K, V>();
    this.forEach((item, index) => {
        const entry = functor(item, index);
        map.set(entry[0], entry[1])
    });
    return map;
};

Array.prototype.chunks = function <T>(this: Array<T>, chunkSize: number): T[][] {
    const result: T[][] = [];
    let i = 0, len = this.length;
    for (; i < len; i += chunkSize) result.push(this.slice(i, i + chunkSize));
    return result;
};

Array.prototype.put = function <T>(this: Array<T>, element: T): T[] {
    const index = this.findIndex(current => equal(current, element));
    if (index == -1) {
        return [...this, element];
    }
    const array = [...this];
    array[index] = element;
    return array;
};

Array.prototype.with = function <T>(this: Array<T>, element: T): T[] {
    this.push(element)
    return this;
};

Array.prototype.withOut = function <T>(this: Array<T>, element: T): T[] {
    return this.filter(removed => !equal(removed, element));
};

Array.prototype.safeIndexOf = function <K, T>(this: Array<T>, element?: T): number {
    if (element == undefined) {
        return -1;
    }
    return this.indexOf(element)
};

Array.prototype.last = function <T>(this: Array<T>): T {
    return this[this.length - 1]
};

Array.prototype.count = function <T>(this: Array<T>, predicate: (element: T) => boolean): number {
    return this.filter(element => predicate(element)).length;
};

export const lengthOf = (array?: Array<any>) => array?.length || 0;

export const range = (end: number, start: number, step: number): number[] => {
    let index = -1
    let length = Math.max(Math.ceil((end - start) / (step || 1)), 0) + 1
    const result = new Array(length)

    while (length--) {
        result[++index] = start
        start += step
    }
    return result
};

export const isEmptyArray = (array?: Array<any>) => !array || array.length < 1;

export const isNotEmptyArray = (array?: Array<any>) => array && array.length > 0;

export const hasIndex = (index: number, array?: Array<any>) => isNotEmptyArray(array) && index >= 0 && array!.length > index;

export const clone = <T>(value?: T): T => {
    if (value == undefined) {
        return undefined as unknown as T;
    }
    if (Array.isArray(value)) {
        return [...value] as unknown as T;
    }
    if (typeof value == "object") {
        return {...value};
    }
    return value;
};

export const asynchronous = <T extends (...args: any[]) => any>(action: T, wait?: number) => debounce(action, wait)();

export const crossEquals = (left?: any[], right?: any[]) => left?.length == right?.length && left?.every(element => right?.has(element));

let previousRandomValue: number;
export const random = (minimum: number = 1, maximum = Number.MAX_VALUE): number => {
    const number = Math.floor((Math.random() * (maximum - minimum + 1)) + minimum);
    previousRandomValue = number === previousRandomValue && minimum !== maximum ? random(minimum, maximum) : number;
    return previousRandomValue;
};
