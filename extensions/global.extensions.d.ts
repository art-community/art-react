interface Set<T> {
    toArray<R>(this: Set<T>, functor?: (element: T) => R): R[];

    with<T>(this: Set<T>, value: T): Set<T>;

    without<T>(this: Set<T>, value: T): Set<T>;
}

interface Map<K, V> {
    valuesToArray<R>(this: Map<K, V>, functor?: (element: V) => R): R[];

    toArray<R>(this: Map<K, V>, functor: (key: K, value: V) => R): R[];

    some<R>(this: Map<K, V>, functor: (key: K, value: V) => boolean): boolean;

    filterEntries(this: Map<K, V>, filter: (key: K, value: V) => boolean): Map<K, V>;

    filterKeys(this: Map<K, V>, filter: (key: K) => boolean): Map<K, V>;

    filterValues(this: Map<K, V>, filter: (value: V) => boolean): Map<K, V>;

    without(this: Map<K, V>, key: K): Map<K, V>;

    with(this: Map<K, V>, key: K, value: V): Map<K, V>;

    isEmpty(): boolean
}

interface Array<T> {
    groupBy<K>(this: Array<T>, functor: (element: T) => K): Map<K, T>;

    groupByMany<K>(this: Array<T>, functor: (element: T) => K): Map<K, T[]>;

    toMap<K, V>(this: Array<T>, functor: (element: T, index: number) => [K, V]): Map<K, V>;

    hasDuplicates<K>(this: Array<T>, functor?: (element: T) => K): boolean;

    duplicates<K>(this: Array<T>, functor?: (element: T) => K): T[];

    has<K>(this: Array<T>, element: T): boolean;

    unique<K>(this: Array<T>, functor?: (element: T) => K): T[];

    chunks<T>(this: Array<T>, count: number): T[][]

    safeIndexOf<K, T>(this: Array<T>, element?: T): number

    put<T>(this: Array<T>, element: T): T[]

    with<T>(this: Array<T>, element: T): T[]

    withOut<T>(this: Array<T>, element: T): T[]

    last<T>(this: Array<T>): T

    count<T>(this: Array<T>, predicate: (element: T) => boolean): number
}
