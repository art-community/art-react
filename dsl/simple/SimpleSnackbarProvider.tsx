import {Widget} from "../../widgets/Widget";
import React from "react";
import {SnackbarProvider, SnackbarProviderProps} from "notistack";

type Properties = Omit<SnackbarProviderProps, "children">

class SnackbarActivator extends Widget<SnackbarActivator, Properties> {
    #widget: Widget<any>

    constructor(widget: Widget<any>, properties?: Properties) {
        super(properties);
        this.#widget = widget;
    }

    draw = () => <SnackbarProvider {...this.properties}>{this.#widget.render()}</SnackbarProvider>
}

export const provideSnackbar = (widget: Widget<any>, properties?: Properties) => new SnackbarActivator(widget, properties);
