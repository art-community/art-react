import {Dispatch, DispatchWithoutAction} from "react";
import equal from "fast-deep-equal";
import {clone} from "../extensions/extensions";

export class Property<T> {
    #beforeUpdateConsumers: ((value: T) => boolean)[] = [];
    #afterUpdateConsumers: Dispatch<T>[] = [];
    #clearConsumers: DispatchWithoutAction[] = [];
    #previous?: T;
    #value?: T;
    #pending?: any;

    constructor(value?: T) {
        this.#value = value;
    }

    get previous() {
        return this.#previous as T;
    }

    get value() {
        return this.#value as T;
    }

    set value(value: T) {
        value = clone(value) as T;
        if (this.#value == undefined) {
            if (this.#beforeUpdateConsumers.some(action => !action(value))) {
                return;
            }
            this.#previous = undefined;
            this.#value = value;
            this.#pending = value;
            this.#afterUpdateConsumers.forEach(action => action(value));
            return
        }
        if (equal(this.#value, value)) {
            this.#value = value;
            this.#pending = value;
            return;
        }
        if (this.#beforeUpdateConsumers.some(action => !action(value))) {
            return;
        }
        this.#previous = clone(this.#value);
        this.#value = value;
        this.#pending = value;
        this.#afterUpdateConsumers.forEach(action => action(value));
        return;
    }

    set = (value: T) => {
        this.value = value;
        return this;
    };

    prevent = (action: (value: T) => boolean): Property<T> => {
        this.#beforeUpdateConsumers.push(action);
        return this;
    };

    consume = (action: Dispatch<T>): Property<T> => {
        this.#afterUpdateConsumers.push(action);
        if (this.#pending != undefined) {
            action(this.#pending);
            return this;
        }
        return this;
    };

    cleared = (action: DispatchWithoutAction): Property<T> => {
        this.#clearConsumers.push(action);
        return this;
    };

    clear = () => {
        this.#previous = clone(this.#value);
        this.#pending = this.#value = undefined;
        this.#clearConsumers.forEach(action => action());
        return this;
    };

}

export const property = <T>(value?: T) => new Property<T>(value);
