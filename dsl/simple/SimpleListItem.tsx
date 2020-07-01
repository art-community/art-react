import * as React from "react";
import {DispatchWithoutAction} from "react";
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Widget} from "../../widgets/Widget";
import {event} from "../../pattern/Event";

type Properties = {
    color?: "primary" | "secondary" | "default"
    path?: string
};

type LinkProperties = {
    icon: Widget<any>
    text: Widget<any>
    path: string
    itemProperties?: Omit<Properties, "key">
}

type ButtonProperties = {
    icon: Widget<any>
    text: Widget<any>
    itemProperties?: Omit<Properties, "key">
}

export class SimpleListItem extends Widget<SimpleListItem, Properties> {
    #icon: Widget<any>;
    #text: Widget<any>;

    constructor(icon: Widget<any>, text: Widget<any>, properties?: Properties) {
        super(properties);
        this.#icon = icon;
        this.#text = text;
    }

    click = event();

    onClick = (action: DispatchWithoutAction) => {
        this.click.handle(action);
        return this;
    };

    draw = () =>
        <ListItem
            component={this.properties?.path ? "a" : "div"}
            button
            href={this.properties?.path}
            color={this.properties?.color}
            {...
                {
                    onClick: (event: any) => {
                        if (event.button == 0) {
                            event.preventDefault()
                        }
                        this.click.execute()
                    }
                }
            }>
            <ListItemIcon>{this.#icon.render()}</ListItemIcon>
            <ListItemText primary={this.#text.render()}/>
        </ListItem>
}

export const linkListItem = (properties: LinkProperties) => {
    const {icon, itemProperties, path, text} = properties;
    return new SimpleListItem(icon, text, {path, ...itemProperties});
};

export const buttonListItem = (properties: ButtonProperties) => {
    const {icon, itemProperties, text} = properties;
    return new SimpleListItem(icon, text, itemProperties);
};
