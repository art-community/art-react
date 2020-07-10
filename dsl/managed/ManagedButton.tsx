import React, {DispatchWithoutAction} from "react";
import {Button, ButtonProps, Grid, IconButton, IconButtonProps, PropTypes} from "@material-ui/core";
import {Configurable} from "../../pattern/Configurable";
import {event} from "../../pattern/Event";
import {Widget} from "../../widgets/Widget";
import {tooltip} from "../simple/SimpleTooltip";
import {label} from "./ManagedLabel";
import {proxy} from "../../widgets/Proxy";
import {isString, isWidget} from "../../extensions/Determiners";

type Properties = ButtonProps & {
    label?: string
    image?: ImageProperties | string
    icon?: IconProperties | Widget<any>
    tooltip?: string;
}

type ImageProperties = {
    width: number
    height: number
    reference: string
}

type IconProperties = {
    widget: Widget<any>
    properties?: IconButtonProps
}

class Configuration extends Configurable<Properties> {
    disabled = this.property(Boolean(this.defaultProperties.disabled));

    color = this.property(this.defaultProperties.color);

    click = event();
}

export class ManagedButton extends Widget<ManagedButton, Properties, Configuration> {
    useClick = this.extract(configuration => configuration.click);

    onClick = (action: DispatchWithoutAction) => this.useClick(click => click.handle(action));

    click = () => {
        if (this.configuration.disabled.value) {
            return this;
        }
        this.configuration.click.execute();
        return this;
    };

    useDisabled = this.extract(configuration => configuration.disabled);

    setDisabled = (value: boolean) => this.useDisabled(disabled => disabled.value = value);

    disable = () => this.setDisabled(true);

    enable = () => this.setDisabled(false);

    disabled = () => Boolean(this.configuration.disabled.value);

    useColor = this.extract(configuration => configuration.color);

    setColor = (value: PropTypes.Color) => this.useColor(color => color.value = value);

    color = () => this.configuration.color.value;

    #renderButton = () => {
        if (this.properties.icon) {
            const properties = isWidget(this.properties.icon) ? {} : this.properties.icon.properties;
            return <IconButton
                {...
                    {
                        ...properties,
                        color: this.configuration.color.value,
                        disabled: this.configuration.disabled.value,
                        onClick: this.configuration.click.execute
                    }
                }>
                {isWidget(this.properties.icon)
                    ? this.properties.icon.render(this.configuration.color.value
                        ? {color: this.configuration.disabled.value ? "disabled" : this.configuration.color.value}
                        : undefined)
                    : this.properties.icon.widget.render(this.configuration.color.value
                        ? {color: this.configuration.disabled.value ? "disabled" : this.configuration.color.value}
                        : undefined)}
            </IconButton>
        }

        if (this.properties.image) {
            return <Button
                {...
                    {
                        ...this.properties,
                        variant: "text",
                        color: this.configuration.color.value,
                        disabled: this.configuration.disabled.value,
                        onClick: this.configuration.click.execute
                    }
                }>
                <Grid container spacing={1} direction={"column"} wrap={"nowrap"} alignItems={"center"}>
                    <Grid item>
                        <img width={isString(this.properties.image) ? undefined : this.properties.image.width}
                             height={isString(this.properties.image) ? undefined : this.properties.image.height}
                             src={isString(this.properties.image) ? this.properties.image : this.properties.image!.reference}
                             alt=""/>
                    </Grid>
                    <Grid item>
                        {this.properties.label}
                    </Grid>
                </Grid>
            </Button>
        }

        const baseProperties = {...this.properties};
        delete baseProperties.label;
        delete baseProperties.image;
        delete baseProperties.icon;
        delete baseProperties.tooltip;

        return <Button
            {...
                {

                    ...baseProperties,
                    color: this.configuration.color.value,
                    disabled: this.configuration.disabled.value,
                    onClick: this.configuration.click.execute
                }
            }>
            {this.properties.label}
        </Button>;
    };

    draw = () => {
        const button = this.#renderButton();
        return this.properties.tooltip
            ? tooltip({placement: "bottom"}).widget(proxy(button)).title(label({text: this.properties.tooltip})).render()
            : button;
    };

}

export const button = (properties?: Properties) => new ManagedButton(properties, Configuration);
