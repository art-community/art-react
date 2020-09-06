import {DispatchWithoutAction} from "react";
import {doNothing} from "../constants/Constants";

export type SynchronizedAction = (synchronizer: Synchronizer) => any;

export class Synchronizer {
    #actions: SynchronizedAction[] = [];
    #managed = false
    #counter = 0;
    #done = false
    #onStart = doNothing;
    #onComplete = doNothing;

    get done() {
        return this.#done;
    }

    managed = () => {
        this.#managed = true;
        return this;
    }

    start = () => {
        if (this.#counter == this.#actions.length) {
            this.#onComplete();
            return;
        }
        this.#onStart();
        if (!this.#managed) {
            this.#actions.forEach(action => action(this));
            return;
        }
        const action = this.#actions.shift();
        if (action) {
            action(this)
        }
    };

    action = (action: SynchronizedAction) => {
        this.#actions.push(action);
        return this;
    };

    process = () => {
        if (++this.#counter >= this.#actions.length) {
            this.#done = true;
            this.#onComplete()
            return this
        }
        if (this.#managed) {
            const action = this.#actions.shift();
            if (action) {
                action(this)
                return this
            }
            return this
        }
        return this
    };

    execute = (action: DispatchWithoutAction) => {
        action()
        this.process();
    }

    reset = () => {
        this.#actions = [];
        this.#counter = 0;
        this.#done = false
        return this
    }

    onStart = (action: DispatchWithoutAction) => {
        const onStart = this.#onStart;
        this.#onStart = () => {
            onStart();
            action()
        }
        return this;
    };

    onComplete = (action: DispatchWithoutAction) => {
        const onComplete = this.#onComplete;
        this.#onComplete = () => {
            action()
            onComplete();
        }
        return this;
    }
}

export const synchronize = (action?: SynchronizedAction) => action
    ? new Synchronizer().action(action)
    : new Synchronizer();
