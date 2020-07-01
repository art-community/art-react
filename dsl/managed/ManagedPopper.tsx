import {Widget} from "../../widgets/Widget";
import {Popper, PopperProps} from "@material-ui/core";
import React, {DispatchWithoutAction} from "react";
import {Closable} from "../../pattern/Optional";
import {Configurable} from "../../pattern/Configurable";
import {doNothing} from "../../constants/Constants";

type Properties = Omit<Omit<PopperProps, "open">, "children"> & {
    visible?: boolean
}

class Configuration extends Configurable<Properties> {
    visible = this.property(Boolean(this.defaultProperties?.visible))
}

export class ManagedPopper extends Widget<ManagedPopper, Properties, Configuration> implements Closable {
    #widget: Widget<any>

    constructor(widget: Widget<any>, properties?: Properties) {
        super(properties, Configuration);
        this.#widget = widget;
    }

    useVisible = this.extract(configuration => configuration.visible);

    onClose = (action: DispatchWithoutAction) => this.useVisible(visible => visible.consume(value => value ? doNothing : action()));

    onOpen = (action: DispatchWithoutAction) => this.useVisible(visible => visible.consume(value => value ? action() : doNothing));

    open = () => this.useVisible(visible => visible.value = true);

    close = () => this.useVisible(visible => visible.value = false);

    visible = () => Boolean(this.configuration.visible);

    widget = (widget: Widget<any>) => {
        this.#widget = widget;
        return this;
    }

    draw = () => {
        const baseProperties = {...this.properties};
        delete baseProperties.visible;
        return <Popper {...baseProperties} open={this.configuration.visible.value}>
            {this.#widget.render()}
        </Popper>;
    }
}

export const popper = (widget: Widget<any>, properties?: Properties) =>
    new ManagedPopper(widget, properties)
