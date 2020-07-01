import {Widget} from "../widgets/Widget";
import React, {useCallback} from "react";
import equal from "fast-deep-equal";

type HookFactory<H> = () => H;

type WidgetFactory<H, W extends Widget<W>> = (hook: H) => W;

type WidgetRefresher<H, W extends Widget<W>> = (hook: H, current?: W) => W;

export class Hooked<H, W extends Widget<W>> extends Widget<Hooked<H, W>> {
    #widgetFactory?: WidgetFactory<H, W>;
    #widget?: W;
    #persisted = false;
    #cached = false;
    #hook: any;
    #lastCalculatedHook?: any;
    #lastCachedValue?: any;
    #cacheFunction?: () => any;

    constructor(factory: HookFactory<H>) {
        super();
        this.widgetName = this.#widget ? `(${this.widgetName}) ${this.#widget.widgetName}` : this.widgetName;
        this.#hook = this.hookValue(factory);
    }

    widget = <W extends Widget<W>>(widgetFactory: WidgetFactory<H, W>) => {
        // @ts-ignore
        this.#widgetFactory = widgetFactory;
        return this as unknown as Hooked<H, W>;
    };

    cache = <W extends Widget<W>>(widgetFactory: WidgetRefresher<H, W>, cacheFunction?: () => any) => {
        // @ts-ignore
        this.#widgetFactory = hook => widgetFactory(hook, this.#widget);
        this.#cached = true;
        this.#cacheFunction = cacheFunction;
        return this as unknown as Hooked<H, W>;
    };

    persist = <W extends Widget<W>>(widgetFactory: WidgetFactory<H, W>) => {
        // @ts-ignore
        this.#widgetFactory = widgetFactory;
        this.#persisted = true;
        return this as unknown as Hooked<H, W>;
    };

    apply = (action: (widget: W) => W) => {
        const factory = this.#widgetFactory;
        if (!factory) {
            throw new Error("Please specify widgetFactory (call widget(), cached() or persist()) before apply something on inner widget.")
        }
        this.#widgetFactory = (hooks: any) => action(factory(hooks) as W);
        if (this.#widget) {
            this.#widget = action(this.#widget as W)
        }
        return this;
    }

    map = <V extends any>(action: (widget: W) => V) => {
        if (!this.#widget) {
            throw new Error("You can't get inner widget before render. Use evaluated() for checking state")
        }
        return action(this.#widget as W) as V;
    };

    get = (): W => this.map(widget => widget);

    evaluated = () => this.#widget != undefined

    draw = () => {
        const newHook = this.#hook();

        if (!this.#widgetFactory) {
            throw new Error("Please specify widgetFactory (call widget(), cached() or persist()) before apply something on inner widget.")
        }

        const getOrCreateWidget = useCallback(() => this.#widget = this.#widget || this.#widgetFactory!(newHook), [this.#widget, newHook]);

        const createWidget = useCallback(() => this.#widget = this.#widgetFactory!(newHook), [this.#widget, newHook]);

        if (this.#persisted) {
            return getOrCreateWidget().render()
        }

        if (this.#cached) {
            if (equal(this.#lastCalculatedHook, newHook)) {
                this.#lastCalculatedHook = newHook;
                if (!this.#cacheFunction) {
                    return getOrCreateWidget().render()
                }
                if (this.#lastCachedValue == undefined) {
                    this.#lastCachedValue = this.#cacheFunction()
                    return getOrCreateWidget().render()
                }
                const newCachedValue = this.#cacheFunction()
                if (equal(this.#lastCachedValue, newCachedValue)) {
                    this.#lastCachedValue = newCachedValue
                    return getOrCreateWidget().render()
                }
                this.#lastCachedValue = newCachedValue
                return createWidget().render()
            }
            this.#lastCalculatedHook = newHook;
            if (!this.#cacheFunction) {
                return createWidget().render()
            }
            const newCachedValue = this.#cacheFunction()
            if (this.#lastCachedValue == undefined) {
                this.#lastCachedValue = newCachedValue
                return getOrCreateWidget().render()
            }
            if (equal(this.#lastCachedValue, newCachedValue)) {
                this.#lastCachedValue = newCachedValue
                return getOrCreateWidget().render()
            }
            this.#lastCachedValue = newCachedValue
            return createWidget().render()
        }

        return createWidget().render()
    }
}

export const hooked = <H extends any>(hook: HookFactory<H>) => new Hooked<H, Widget<any>>(hook);
