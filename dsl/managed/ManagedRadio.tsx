import React, {Dispatch} from "react";
import {Grid, Radio, RadioProps, Typography} from "@material-ui/core";
import {Configurable} from "../../pattern/Configurable";
import {Widget} from "../../widgets/Widget";
import {fromCheckEvent} from "../../constants/Constants";

type Properties = RadioProps & {
    label?: string | Widget<any>
}

class Configuration extends Configurable<Properties> {
    disabled = this.property(Boolean(this.defaultProperties.disabled));

    color = this.property(this.defaultProperties.color);

    checked = this.property(Boolean(this.defaultProperties.checked))
}

export class ManagedRadio extends Widget<ManagedRadio, Properties, Configuration> {
    useChecked = this.extract(configuration => configuration.checked);

    useDisabled = this.extract(configuration => configuration.disabled);

    setDisabled = (value: boolean) => this.useDisabled(disabled => disabled.value = value);

    disable = () => this.setDisabled(true);

    enable = () => this.setDisabled(false);

    disabled = () => this.configuration.disabled.value;

    useColor = this.extract(configuration => configuration.color);

    onCheck = (action: Dispatch<boolean>) => {
        this.configuration.checked.consume(action);
        return this;
    };

    setChecked = (value: boolean) => this.useChecked(checked => checked.value = value);

    check = () => this.setChecked(true);

    checked = () => Boolean(this.configuration.checked.value);

    uncheck = () => this.setChecked(false);

    setColor = (value: 'primary' | 'secondary' | 'default') => this.useColor(color => color.value = value);

    color = () => this.configuration.color.value;

    draw = () => {
        if (!this.properties.label) {
            return <Radio
                {...
                    {
                        ...this.properties,
                        color: this.configuration.color.value,
                        disabled: this.configuration.disabled.value,
                        checked: this.configuration.checked.value,
                        onChange: fromCheckEvent(this.configuration.checked.set)
                    }
                }
            />
        }

        const label =
            <Grid item style={{cursor: "default"}}>
                {typeof this.properties.label == "string"
                    ? <Typography onClick={() => this.configuration.checked.value = !this.configuration.checked.value}>
                        {this.properties.label}
                    </Typography>
                    : (this.properties.label as Widget<any>).render()
                }
            </Grid>;

        const baseProperties = {...this.properties};

        return <Grid alignItems={"center"} container wrap={"nowrap"} spacing={1}>
            <Grid item>
                <Radio
                    {...
                        {
                            ...baseProperties,
                            color: this.configuration.color.value,
                            disabled: this.configuration.disabled.value,
                            checked: this.configuration.checked.value,
                            onChange: fromCheckEvent(this.configuration.checked.set)
                        }
                    }
                />
            </Grid>
            {label}
        </Grid>;
    };
}

export const radio = (properties?: Properties) => new ManagedRadio(properties, Configuration);
