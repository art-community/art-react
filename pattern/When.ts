import {Widget} from "../widgets/Widget";
import {conditional, Conditional} from "./Conditional";
import {group} from "../dsl/simple/SimpleGroup";

type Predicate = () => any;

export class When extends Widget<When> {
    #conditions: Conditional<Widget<any>>[] = []

    else = (stub: Widget<any> | (() => Widget<any>)) => {
        this.#conditions.forEach(condition => condition.else(stub));
        return this;
    };

    widget = (predicate: Predicate, widgetFactory: () => Widget<any>) => {
        this.#conditions.push(conditional(predicate).widget(widgetFactory));
        return this
    };

    cache = (predicate: Predicate, widgetFactory: () => Widget<any>, cacheFunction: () => any) => {
        this.#conditions.push(conditional(predicate).cache(widgetFactory, cacheFunction));
        return this
    };

    persist = (predicate: Predicate, widgetFactory: () => Widget<any>) => {
        this.#conditions.push(conditional(predicate).persist(widgetFactory));
        return this;
    };

    apply = (action: (widget: Widget<any>) => Widget<any>) => {
        this.#conditions.forEach(condition => condition.apply(action))
        return this;
    }

    map = <V extends any>(action: (widget: Widget<any>) => V) => this.#conditions.map(condition => condition.map(action)).find(result => result != undefined);

    all = () => this.#conditions.map(condition => condition.get()).filter(condition => condition != undefined);

    current = <W extends Widget<any>>(): W | undefined => this.#conditions.find(condition => condition.true())?.get() as W;

    draw = () => group().widgets(this.#conditions).render();
}

export const when = (): When => new When();
