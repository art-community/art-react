import {FormControlLabel, Switch, SwitchProps, Typography} from "@material-ui/core";
import {Configurable} from "../../pattern/Configurable";
import {Widget} from "../../widgets/Widget";
import React, {Dispatch} from "react";
import {fromCheckEvent} from "../../constants/Constants";

type Properties = SwitchProps & {
    label?: string | Widget<any>
}

class Configuration extends Configurable<Properties> {
    checked = this.property(Boolean(this.defaultProperties.checked))
}

export class ManagedSwitch extends Widget<ManagedSwitch, Properties, Configuration> {
    useChecked = this.extract(configuration => configuration.checked);

    setChecked = (value: boolean) => this.useChecked(checked => checked.value = value);

    check = () => this.setChecked(true);

    onCheck = (action: Dispatch<boolean>) => {
        this.useChecked(checked => checked.consume(action));
        return this;
    };

    checked = () => Boolean(this.configuration.checked.value);

    uncheck = () => this.setChecked(false);

    draw = () => <FormControlLabel
        control={<Switch {...this.properties}
                         checked={this.checked()}
                         onChange={fromCheckEvent(this.setChecked)}/>}
        label={typeof this.properties.label == "string"
            ? <Typography>{this.properties.label}</Typography>
            : (this.properties.label as Widget<any>).render()
        }
    />;
}

export const switcher = (properties?: Properties) => new ManagedSwitch(properties, Configuration);
