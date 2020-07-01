import {CircularProgress, GridDirection, IconButton, useTheme} from "@material-ui/core";
import React, {DispatchWithoutAction} from "react";
import {Widget} from "../../../widgets/Widget";
import {observe} from "../../../pattern/Observable";
import {isNotEmptyArray} from "../../../extensions/extensions";
import {fromMouseEvent} from "../../../constants/Constants";
import {Configurable} from "../../../pattern/Configurable";
import {horizontalGrid} from "../ManagedGrid";
import {button} from "../ManagedButton";

type ButtonsGridProperties = {
    buttons: CardMenuButton[]
    direction?: GridDirection
}

type ProgressProperties = {
    color?: string
}

export type CardMenuButton = {
    tooltip: string
    icon: Widget<any>
    onClick?: DispatchWithoutAction
}

export type CardMenuIndicatorProperties = {
    progress?: ProgressProperties | boolean
    icon?: Widget<any>
    onClick?: DispatchWithoutAction
}

export type CardMenuProperties = {
    actions?: ButtonsGridProperties;
    indicator?: CardMenuIndicatorProperties;
}

const useStyle = (progressBarColor?: string) => {
    const theme = useTheme();
    return observe(theme, progressBarColor).render(() => ({
        progress: {
            color: progressBarColor ? progressBarColor : theme.palette.primary.main,
            animationDuration: "550ms"
        }
    }));
};

class Configuration extends Configurable<CardMenuProperties> {
    menu = this.property(this.defaultProperties);
}

export class CardMenu extends Widget<CardMenu, CardMenuProperties, Configuration> {
    useMenu = this.extract(configuration => configuration.menu);

    menuAsButtons = (buttons: CardMenuButton[], direction?: GridDirection) => {
        this.useMenu(property => property.value = {actions: {buttons: [...buttons], direction: direction}});
        return this;
    };

    menuAsIndicator = (indicator: CardMenuIndicatorProperties) => {
        this.useMenu(property => property.value = {indicator: indicator});
        return this;
    };

    setMenu = (menu: CardMenuProperties) => {
        this.useMenu(property => property.value = menu);
        return this;
    };

    updateMenu = (decorator: (current?: CardMenuProperties) => CardMenuProperties) => {
        this.useMenu(property => property.value = decorator(property.value));
        return this;
    };

    setMenuButtons = (buttons: CardMenuButton[]) => {
        this.useMenu(property => property.value = {actions: {buttons: buttons}});
        return this;
    };

    updateMenuButtons = (decorator: (current: CardMenuButton[], direction?: GridDirection) => CardMenuButton[]) => {
        this.useMenu(property => property.value = {
            actions: {
                buttons:
                    [
                        ...decorator(property.value?.actions?.buttons || [], property.value?.actions?.direction)
                    ]
            }
        });
        return this;
    };

    updateMenuIndicator = (decorator: (current?: CardMenuIndicatorProperties) => CardMenuIndicatorProperties) => {
        this.useMenu(property => property.value = {indicator: decorator(property.value?.indicator)});
        return this;
    };

    addMenuButton = (button: CardMenuButton) => {
        this.menuAsButtons([button]);
        return this;
    };


    draw = () => {
        const {actions, indicator} = this.configuration.menu.value;

        const progressColor = typeof indicator?.progress == "boolean"
            ? undefined
            : (indicator?.progress as ProgressProperties)?.color;

        const style = useStyle(progressColor);

        if (indicator) {
            if (indicator.icon) {
                return <div onClick={fromMouseEvent(indicator!.onClick)}>{indicator!.icon!.render()}</div>
            }

            if (indicator.progress) {
                if (indicator.onClick) {
                    return <IconButton color={"primary"} onClick={fromMouseEvent(indicator!.onClick)}>
                        <CircularProgress
                            variant="indeterminate"
                            disableShrink
                            size={20}
                            thickness={4}
                            style={style.progress}/>
                    </IconButton>;
                }
                return <CircularProgress variant="indeterminate"
                                         disableShrink
                                         size={20}
                                         thickness={4}
                                         style={style.progress}/>;
            }

            return <></>;
        }

        if (actions && isNotEmptyArray(actions.buttons)) {
            return horizontalGrid({spacing: 1})
            .pushWidgets(actions
                .buttons
                .map(action => button({
                    icon: action.icon,
                    tooltip: action.tooltip
                })
                .onClick(() => action.onClick?.()))
            )
            .render()
        }

        return <></>
    };
}

export const cardMenu = (properties?: CardMenuProperties) => new CardMenu(properties, Configuration);
