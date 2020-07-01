import {Chip, ChipProps} from "@material-ui/core";
import React, {DispatchWithoutAction} from "react";
import {Widget} from "../../widgets/Widget";

type Properties = ChipProps

export class SimpleChip extends Widget<SimpleChip, Properties> {
    draw = () => <Chip {...this.properties}/>;
}

export const chip = (properties?: Properties) => new SimpleChip(properties);

export const iconChip = (icon: Widget<any>, properties?: Properties) => chip({...properties, icon: icon.render()});

export const labelChip = (label: string, properties?: Properties) => chip({...properties, label: label});

export const clickableChip = (label: string, onClick: DispatchWithoutAction, properties?: Properties) => chip({clickable: true, label, onClick, ...properties});
