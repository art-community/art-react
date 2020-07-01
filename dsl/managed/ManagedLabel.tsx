import {Typography, TypographyProps} from "@material-ui/core";
import React from "react";
import {Configurable} from "../../pattern/Configurable";
import {Widget} from "../../widgets/Widget";

type Properties = TypographyProps & {
    text: string
}

class Configuration extends Configurable<Properties> {
    text = this.property(this.defaultProperties.text);
}

export class ManagedLabel extends Widget<ManagedLabel, Properties, Configuration> {
    useText = this.extract(configuration => configuration.text);

    text = () => this.configuration.text;

    setText = (value: string) => this.useText(text => text.value = value);

    draw = () => <Typography {...this.properties}>{this.configuration.text.value}</Typography>;
}

export const label = (properties: Properties | string) => typeof properties == "string"
    ? new ManagedLabel({text: properties}, Configuration)
    : new ManagedLabel(properties, Configuration);
