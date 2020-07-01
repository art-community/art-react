import {Widget} from "../../widgets/Widget";
import React from 'react';

export class SimpleGroup extends Widget<SimpleGroup> {
    #widgets: Widget<any>[] = [];

    widgets = (widgets: Widget<any>[]) => {
        widgets.forEach(this.widget);
        return this;
    };

    widget = (widget: Widget<any>) => {
        this.#widgets.push(widget)
        return this;
    }

    draw = () => <>{this.#widgets.map(widget => widget.render())}</>;
}

export const group = () => new SimpleGroup();
