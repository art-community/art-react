import {createStyles} from "@material-ui/core";
import React, {DispatchWithoutAction} from "react";
import {Widget} from "../../widgets/Widget";
import {SpeedDial, SpeedDialAction, SpeedDialIcon, SpeedDialProps} from "@material-ui/lab";
import Menu from "@material-ui/icons/Menu";
import MenuOpen from "@material-ui/icons/MenuOpen";
import {label} from "./ManagedLabel";
import {makeStyles} from "@material-ui/styles";
import {Configurable} from "../../pattern/Configurable";

type Properties = SpeedDialProps

const useTooltipStyle = makeStyles(() => createStyles({
        noMaxWidth: {
            maxWidth: "none"
        }
    }
));

type ButtonProperties = {
    tooltip: string
    icon: Widget<any>
    onClick?: DispatchWithoutAction
}

class Configuration extends Configurable<Properties> {
    buttons = this.property<ButtonProperties[]>([])
}

export class ManagedSpeedDial extends Widget<ManagedSpeedDial, Properties, Configuration> {
    #open = false;

    #toolTipStyle = this.hookValue(useTooltipStyle);

    #renderButton = (button: ButtonProperties) => <SpeedDialAction
        key={button.tooltip}
        title={label({text: button.tooltip, variant: "subtitle2"}).render()}
        icon={button.icon.render()}
        FabProps={{onClick: button.onClick}}
        tooltipPlacement={"bottom"}
        TooltipClasses={{tooltip: this.#toolTipStyle().noMaxWidth}}
    />;

    useButtons = this.extract(configuration => configuration.buttons);

    addButton = (properties: ButtonProperties) => {
        this.configuration.buttons.value = [...this.configuration.buttons.value, properties]
        return this;
    }

    addButtons = (properties: ButtonProperties[]) => {
        this.configuration.buttons.value = [...this.configuration.buttons.value, ...properties]
        return this;
    }

    setButtons = (properties: ButtonProperties[]) => {
        this.configuration.buttons.value = properties
        return this;
    }

    draw = () => <SpeedDial  {...this.properties}
                             direction={"left"}
                             ariaLabel={this.widgetName}
                             open={this.#open}
                             onOpen={() => {
                                 this.#open = true;
                                 this.notify();
                             }}
                             onClose={() => {
                                 this.#open = false;
                                 this.notify();
                             }}
                             FabProps={{size: "medium"}}
                             icon={<SpeedDialIcon icon={<Menu/>} openIcon={<MenuOpen/>}/>}>
        {this.configuration.buttons.value.map(this.#renderButton)}
    </SpeedDial>;
}

export const speedDial = (properties?: Properties) => new ManagedSpeedDial(properties, Configuration);

export const speedDialButton = (properties: ButtonProperties) => properties;
