import {Theme, ThemeProvider} from "@material-ui/core";
import React from "react";
import {Widget} from "../../widgets/Widget";
import {Configurable} from "../../pattern/Configurable";

type Properties = {
    theme: Theme
}

class Configuration extends Configurable<Properties> {
    theme = this.property(this.defaultProperties.theme);
}

export class ManagedThemeProvider extends Widget<ManagedThemeProvider, Properties, Configuration> {
    #widget: Widget<any>;

    useTheme = this.extract(configuration => configuration.theme);

    constructor(theme: Theme, widget: Widget<any>) {
        super({theme}, Configuration);
        this.#widget = widget;
    }

    get renderWithoutChanges() {
        return true;
    }

    draw = () => <ThemeProvider theme={this.configuration.theme.value}>{this.#widget.render()}</ThemeProvider>
}

export const provideTheme = (theme: Theme, widget: Widget<any>) => new ManagedThemeProvider(theme, widget);
