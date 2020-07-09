import {Trigger} from "./Trigger";
import {property} from "./Property";
import {hookContainer} from './HookContainer';
import {Widget, WidgetState} from "../widgets/Widget";

export class Configurable<P = {}> {
    readonly hooks = hookContainer();

    defaultProperties: P;

    #trigger?: Trigger;

    #widget: Widget<any>;

    #renderPaused = false;

    constructor(widget: Widget<any>, properties?: P) {
        this.#widget = widget;
        this.defaultProperties = properties || {} as P;
    }

    get trigger() {
        return this.#trigger;
    }

    bindTrigger = (trigger: Trigger) => {
        if (this.#trigger) {
            this.#trigger.connect(trigger);
            return this;
        }
        this.#trigger = trigger;
        return this;
    };

    notifyTrigger = () => {
        if (this.#widget.state == WidgetState.UNMOUNTED || this.#renderPaused) {
            return this;
        }
        if (!this.#trigger) {
            return this;
        }
        this.#trigger.notify();
        return this;
    };

    pauseRender = () => {
        this.#renderPaused = true;
        return this;
    };

    continueRender = () => {
        if (!this.#renderPaused) {
            return this;
        }
        this.#renderPaused = false;
        this.notifyTrigger();
        return this;
    };

    protected property = <T>(value?: T) => property<T>(value).consume(this.notifyTrigger).cleared(this.notifyTrigger);

    protected hookValue = this.hooks.hookValue;

    protected hookFunction = this.hooks.hookFunction;
}
