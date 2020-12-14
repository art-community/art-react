import {Dispatch, DispatchWithoutAction} from "react";
import {doNothing} from "../constants/Constants";
import {random} from "../extensions/extensions";

export class Trigger {
    #notifyListener: Dispatch<number>;
    #disposeListener: DispatchWithoutAction;

    constructor(notifyListener: Dispatch<number>, disposeListener: DispatchWithoutAction) {
        this.#notifyListener = notifyListener;
        this.#disposeListener = disposeListener;
    }

    dispose = () => {
        this.#notifyListener = doNothing;
        this.#disposeListener();
        this.#disposeListener = doNothing;
        return this;
    }

    notify = () => {
        this.#notifyListener(random());
        return this;
    };
}
