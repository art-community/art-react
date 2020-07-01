import React from "react";
import {Container, ContainerProps} from "@material-ui/core";
import {Widget} from "../../widgets/Widget";

type Properties = ContainerProps;

export class SimpleContainer extends Widget<SimpleContainer, Properties> {
    #widget: Widget<any>;

    constructor(widget: Widget<any>, properties?: Properties) {
        super(properties);
        this.#widget = widget;
    }

    draw = () =>
        <Container {...this.properties}>
            {this.#widget.render()}
        </Container>
}

export const container = (widget: Widget<any>, properties?: Properties) => new SimpleContainer(widget, properties);
