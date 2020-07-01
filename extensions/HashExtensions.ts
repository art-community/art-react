import sum from "hash-sum"

export const hashOf = (value?: any) => value == undefined ? "" : sum(value);
