import {Dispatch} from "react";
import {doNothing} from "../constants/Constants";

export class Trigger {
    #listener: Dispatch<number>;

    constructor(listener: Dispatch<number>) {
        this.#listener = listener;
    }

    notify = () => {
        this.#listener(Math.random());
        return this;
    };
}
