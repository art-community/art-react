import {Dispatch, DispatchWithoutAction} from "react";
import {ADD_EVENT, DELETE_EVENT, UPDATE_EVENT} from "../../constants/EventTypes";
import {doNothing} from "../constants/Constants";

export type StreamEvent<T> = {
    type: string
    data: T & { id: number }
}

export class Stream<T> {
    #addSubscribers: Dispatch<T>[] = [];
    #updateSingleSubscribers: Map<number, Dispatch<T>[]> = new Map();
    #updateManySubscribers: Dispatch<T>[] = [];
    #deleteSubscribers: Dispatch<T>[] = [];
    #stopAction: DispatchWithoutAction = doNothing;

    start = (stopAction: DispatchWithoutAction) => {
        this.#stopAction = stopAction;
        return this;
    };

    stop = () => {
        this.#stopAction();
    };

    subscribeOnAdd = (onAdd: Dispatch<T>) => {
        return this.#addSubscribers.push(onAdd) - 1;
    };

    subscribeOnDelete = (onDelete: Dispatch<T>) => {
        return this.#deleteSubscribers.push(onDelete) - 1;
    };

    subscribeOnUpdateSingle = (id: number, handler: Dispatch<T>) => {
        if (this.#updateSingleSubscribers.has(id)) {
            return this.#updateSingleSubscribers.get(id)!.push(handler) - 1;
        }
        this.#updateSingleSubscribers.set(id, [handler]);
        return 0;
    };

    subscribeOnUpdateMany = (handler: Dispatch<T>) => {
        return this.#updateManySubscribers.push(handler) - 1;
    };

    unsubscribeFromAdd = (index: number) => {
        this.#addSubscribers[index] = doNothing;
    };

    unsubscribeFromDelete = (index: number) => {
        this.#deleteSubscribers[index] = doNothing;
    };

    unsubscribeFromUpdateMany = (index: number) => {
        this.#updateManySubscribers[index] = doNothing
    };

    unsubscribeFromUpdateSingle = (id: number, index: number) => {
        if (this.#updateSingleSubscribers.has(id)) {
            this.#updateSingleSubscribers.get(id)![index] = doNothing
        }
    };

    produceEvent = (event: StreamEvent<T>) => {
        switch (event.type) {
            case ADD_EVENT:
                this.#addSubscribers.forEach(notify => notify(event.data));
                return;
            case UPDATE_EVENT:
                this.#updateManySubscribers.forEach(notify => notify(event.data));
                if (!this.#updateSingleSubscribers.has(event.data.id)) {
                    return;
                }
                this.#updateSingleSubscribers.get(event.data.id)!.forEach(notify => notify(event.data));
                return;
            case DELETE_EVENT:
                this.#deleteSubscribers.forEach(notify => notify(event.data));
                return;
        }
    };
}

export const stream = <T>(stopAction: DispatchWithoutAction) => new Stream<T>().start(stopAction);
