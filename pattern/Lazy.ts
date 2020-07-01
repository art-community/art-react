export const lazy = <T>(valueFactory: () => T) => {
    let value: T | undefined = undefined;
    return () => value == undefined ? value = valueFactory() : value
};
