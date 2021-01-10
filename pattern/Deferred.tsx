import {Renderer} from "./Renderer";
import React, {useMemo} from "react";

export class Deferred {
    #register: (value: Deferred, renderer: () => JSX.Element) => JSX.Element;

    constructor(values: any[], register: (value: Deferred, renderer: () => JSX.Element) => JSX.Element) {
        this.values = values;
        this.#register = register;
    }

    values: any[];

    render = (renderer: () => JSX.Element): JSX.Element => this.#register(this, renderer);
}

export const defer = (...values: any[]) => {
    const key = Math.random();
    return new Deferred(values, (observable, renderer): any => <Renderer key={key} factory={() => useMemo(renderer, values)}/>);
};
