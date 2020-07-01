import {useCallback, useMemo} from "react";

export const immutable = <T>(value: T) => useMemo(() => value, []);

export const immutableFactory = <T>(value: () => T) => useMemo(value, []);

export const immutableFunction = <T extends (...args: any[]) => any>(callback: T): T => useCallback(callback, []);