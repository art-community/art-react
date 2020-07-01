import {Widget} from "../widgets/Widget";
import {empty} from "../dsl/simple/SimpleEmptyComponent";
import equal from "fast-deep-equal";

type Predicate = () => any;

type WidgetFactory<W extends Widget<W>> = () => W;

type WidgetRefresher<W extends Widget<W>> = (current?: W) => W;

export class Conditional<W extends Widget<W>> extends Widget<Conditional<W>> {
    #predicate: Predicate = () => true;
    #stub: Widget<any> = empty();
    #stubFactory?: WidgetFactory<W>;
    #widgetFactory: WidgetFactory<W> = () => empty() as unknown as W;
    #widget?: W;
    #persisted = false;
    #cached = false;
    #lastCachedValue?: any;
    #cacheFunction?: () => any;

    #getOrCreateWidget = () => this.#widget = this.#widget || this.#widgetFactory();

    #createWidget = () => this.#widget = this.#widgetFactory();

    #createStub = () => this.#stubFactory?.() || this.#stub;

    predicate = (predicate: Predicate) => {
        this.#predicate = predicate;
        return this as Conditional<W>;
    };

    else = (stub: Widget<any> | WidgetFactory<any>) => {
        if (stub instanceof Widget) {
            this.#stub = stub;
            return this as Conditional<W>;
        }
        this.#stubFactory = stub as WidgetFactory<any>;
        return this as Conditional<W>;
    };

    widget = <W extends Widget<W>>(widgetFactory: WidgetFactory<W>) => {
        // @ts-ignore
        this.#widgetFactory = widgetFactory;
        return this as unknown as Conditional<W>;
    };

    cache = <W extends Widget<W>>(widgetFactory: WidgetRefresher<W>, cacheFunction: () => any) => {
        // @ts-ignore
        this.#widgetFactory = () => widgetFactory(this.#widget as W);
        this.#cached = true;
        this.#cacheFunction = cacheFunction;
        return this as unknown as Conditional<W>;
    };

    persist = <W extends Widget<W>>(widgetFactory: WidgetFactory<W>) => {
        // @ts-ignore
        this.#widgetFactory = widgetFactory;
        this.#persisted = true;
        return this as unknown as Conditional<W>;
    };

    apply = (action: (widget: W) => W) => {
        const factory = this.#widgetFactory;
        this.#widgetFactory = () => action(factory() as W);
        if (this.#widget) {
            this.#widget = action(this.#widget as W)
        }
        return this as Conditional<W>;
    }

    map = <V extends any>(action: (widget: W) => V) => {
        if (!this.#widget) {
            return undefined;
        }
        return action(this.#widget as W) as V;
    };

    get = (): W | undefined => this.map(widget => widget);

    true = () => this.get() != undefined;

    false = () => this.get() == undefined;

    draw = () => {
        if (!this.#predicate()) {
            if (this.#cached && this.#cacheFunction) {
                this.#lastCachedValue = this.#cacheFunction();
                return this.#createStub().render();
            }
            return this.#createStub().render();
        }

        if (this.#persisted) {
            return this.#getOrCreateWidget().render();
        }

        if (!this.#cached || !this.#cacheFunction) {
            return this.#createWidget().render();
        }

        if (this.#lastCachedValue == undefined) {
            this.#lastCachedValue = this.#cacheFunction();
            return this.#getOrCreateWidget().render();
        }

        const newCacheValue = this.#cacheFunction();
        if (equal(this.#lastCachedValue, newCacheValue)) {
            this.#lastCachedValue = newCacheValue;
            return this.#getOrCreateWidget().render();
        }

        this.#lastCachedValue = newCacheValue;
        return this.#createWidget().render();
    };
}

export const conditional = (predicate?: Predicate): Conditional<Widget<any>> => predicate
    ? new Conditional<Widget<any>>().predicate(predicate)
    : new Conditional<Widget<any>>();
