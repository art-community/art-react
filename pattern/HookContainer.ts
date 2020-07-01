export class HookContainer {
    #hookFactories: (() => unknown)[] = [];
    #evaluatedHooks: unknown[] = [];
    #evaluated = false;

    hookValue = <T extends any>(factory: () => T) => {
        const index = this.#hookFactories.push(factory) - 1;
        return () => {
            const hook = this.#evaluatedHooks[index] as T;
            if (!hook) {
                throw new Error("You can't use hooks not in rendering process. Please call evaluate() before using hooks.")
            }
            return hook;
        };
    };

    hookFunction = <T extends (...args: any[]) => any>(callback: T) => {
        const index = this.#hookFactories.push(callback) - 1;
        return (...args: any[]) => {
            const hook = this.#evaluatedHooks[index] as T;
            if (!hook) {
                throw new Error("You can't use hooks not in rendering process. Please call evaluate() before using hooks.")
            }
            return hook(...args);
        };
    };

    evaluate = () => {
        this.#evaluatedHooks = [];
        this.#evaluated = true;
        this.#hookFactories.forEach(factory => this.#evaluatedHooks.push(factory()));
    };

    evaluated = () => this.#evaluated;
}

export const hookContainer = () => new HookContainer();
