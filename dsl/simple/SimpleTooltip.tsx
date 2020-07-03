import {Widget} from "../../widgets/Widget";
import {createStyles, Grid, Tooltip, TooltipProps} from "@material-ui/core";
import React from "react";
import {makeStyles} from "@material-ui/styles";
import {empty} from "./SimpleEmptyComponent";
import {DEFAULT_TOOLTIP_TRANSITION_TIMEOUT} from "../../constants/Constants";

type Properties = Omit<Omit<TooltipProps, "children">, "title"> & {}

const useTooltipStyle = makeStyles(() => createStyles({
        noMaxWidth: {
            maxWidth: "none"
        }
    }
));

export class SimpleTooltip extends Widget<SimpleTooltip, Properties> {
    #widget: Widget<any> = empty();
    #title: Widget<any> = empty();

    widget = (widget: Widget<any>) => {
        this.#widget = widget;
        return this;
    }

    title = (title: Widget<any>) => {
        this.#title = title;
        return this;
    }

    draw = () => {
        const style = useTooltipStyle();
        return <Grid container> {/*I don't known why, but without it tooltip bugged...*/}
            <Tooltip
                {
                    ...{
                        ...this.properties,
                        TransitionProps: {
                            timeout: DEFAULT_TOOLTIP_TRANSITION_TIMEOUT
                        },
                        title: this.#title.render(),
                        classes: {tooltip: style.noMaxWidth}
                    }
                }>
                <span>
                    {this.#widget.render()}
                </span>
            </Tooltip>
        </Grid>;
    };
}

export const tooltip = (properties?: Properties) => new SimpleTooltip(properties);
