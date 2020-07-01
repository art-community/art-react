import {Dispatch} from "react";
import {doNothing} from "../constants/Constants";

export class Trigger {
    #listener: Dispatch<number>;
    #connected: Trigger[] = [];

    constructor(listener: Dispatch<number>) {
        this.#listener = listener;
    }

    connect = (trigger: Trigger) => {
        this.#connected.push(trigger);
        this.#listener = trigger.#listener;
        return this;
    };

    dispose = () => {
        this.#listener = doNothing;
        this.#connected.forEach(trigger => trigger.dispose());
        this.#connected = [];
        return this;
    };

    notify = () => {
        this.#listener(Math.random());
        return this;
    };
}
