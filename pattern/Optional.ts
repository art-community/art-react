import {conditional} from "./Conditional";
import {StaticWidget, Widget} from "../widgets/Widget";
import {DispatchWithoutAction} from "react";
import {empty} from "../dsl/simple/SimpleEmptyComponent";
import {doNothing} from "../constants/Constants";

type Properties = {
    spawned?: boolean
}

export interface Closable extends Widget<any> {
    onClose: (action: DispatchWithoutAction) => Closable
}

export class Optional<T extends Widget<any>> extends StaticWidget<Optional<T>, Properties> {
    #spawned = this.properties.spawned;
    #spawnProperties?: any;
    #conditional = conditional(() => this.#spawned)
    #onDestroy = doNothing;
    #onSpawn = doNothing;
    #factory: (properties?: unknown) => T = () => empty() as unknown as T;

    constructor(widgetFactory: (properties?: any) => T, properties?: Properties) {
        super(properties);
        this.#factory = widgetFactory;
        this.#conditional
        .cache(() => widgetFactory(this.#spawnProperties), () => this.#spawned)
        .apply((widget: T) => {
            if ((widget as unknown as Closable).onClose) {
                (widget as unknown as Closable).onClose(this.destroy)
            }
            return widget;
        });
    }

    get spawned() {
        return this.#spawned;
    }

    apply = (action: (widget: T) => T) => {
        this.#conditional.apply(action)
        return this;
    }

    get = (): T => this.#conditional.get() as T;

    spawn = (properties?: any) => {
        this.#spawnProperties = properties;
        this.#spawned = true;
        this.notify();
        this.#onSpawn();
        return this;
    }

    destroy = () => {
        this.#spawned = false;
        this.notify();
        this.#onDestroy();
        return this;
    }

    onDestroy = (action: DispatchWithoutAction) => {
        this.#onDestroy = action;
        return this;
    }

    onSpawn = (action: DispatchWithoutAction) => {
        this.#onSpawn = action;
        return this;
    }

    persist = (properties?: any) => {
        this.#conditional.persist(() => this.#factory(properties) as T).apply((widget: T) => {
            if ((widget as unknown as Closable).onClose) {
                (widget as unknown as Closable).onClose(this.destroy)
            }
            return widget;
        });
        return this;
    }

    draw = this.#conditional.render
}

export const optional = <T extends Widget<any>>(factory: (properties?: any) => T, spawned?: boolean) => new Optional<T>(factory, {spawned});
