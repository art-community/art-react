import {Dispatch, DispatchWithoutAction} from "react";

class Event<T> {
    #consumers: Dispatch<T | undefined>[] = [];

    handle = (action: Dispatch<T> | DispatchWithoutAction) => {
        this.#consumers.push(action);
        return this;
    };

    execute = (data?: any) => {
        this.#consumers.forEach(consumer => consumer(data));
    };

    clear = () => {
        this.#consumers = [];
    };
}

export const event = <T = undefined>() => new Event<T>();
