import React from "react";
import {Widget} from "../../widgets/Widget";
import {List, ListProps} from "@material-ui/core";

type Properties = ListProps;

export class SimpleList extends Widget<SimpleList, Properties> {
    #items: Widget<any>[] = [];

    items = (items: Widget<any>[]) => {
        this.#items = [...items];
        return this;
    };

    item = (item: Widget<any>) => {
        this.#items.push(item);
        return this;
    };

    draw = () =>
        <List {...this.properties}>
            {this.#items.map(item => item.render())}
        </List>
}

export const list = (properties?: Properties) => new SimpleList(properties);
