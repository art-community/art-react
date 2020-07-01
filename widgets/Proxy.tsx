import * as React from "react";
import {Widget} from "./Widget";
import {Key} from "react";

class Proxy extends Widget<Proxy> {
    #widget = <></>;
    #key?: Key;

    key = () => this.#key != undefined ? this.#key : this.id;

    constructor(widget: any, key?: Key) {
        super();
        const name = widget.type.name || widget.type.displayName;
        this.#key = key;
        this.widgetName = name == undefined ? this.widgetName : `${this.widgetName} to ${name}`
        this.#widget = widget;
    }

    draw = () => this.#widget;
}

export const proxy = (widget: JSX.Element, key?: Key) => new Proxy(widget, key);
