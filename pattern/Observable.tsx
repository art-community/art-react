import React, {useMemo} from "react";

export class Observable {
    #register: <T>(value: Observable, renderer: () => T) => T;

    constructor(values: any[], register: <T>(value: Observable, renderer: () => T) => T) {
        this.values = values;
        this.#register = register;
    }

    values: any[];

    render = <T extends any>(renderer: () => T): T => this.#register(this, renderer);
}

export const observe = (...values: any[]) => new Observable(values, (observable, renderer) => useMemo(renderer, values));