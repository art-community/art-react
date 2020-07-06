import React, {CSSProperties, DispatchWithoutAction} from "react";
import {Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Grid, GridProps, IconButton, Typography} from "@material-ui/core";
import {Configurable} from "../../pattern/Configurable";
import CloseOutlined from "@material-ui/icons/CloseOutlined";
import {Widget} from "../../widgets/Widget";
import {label} from "./ManagedLabel";
import {button} from "./ManagedButton";
import {SimpleDraggablePaper} from "../simple/SimpleDraggablePaper";
import {isNotEmptyArray} from "../../extensions/extensions";
import {Closable} from "../../pattern/Optional";
import {DEFAULT_DIALOG_BACKDROP_COLOR, DEFAULT_DIALOG_TRANSITION_TIMEOUT, doNothing, handleEnter} from "../../constants/Constants";

type Properties = Omit<DialogProps, "open"> & {
    label?: string
    fullWidth?: boolean
    fullScreen?: boolean
    visible?: boolean
    contentStyle?: CSSProperties
    static?: boolean
}

type NotificationProperties = Properties & {
    notification: string
    label: string
    buttonLabel: string
}

type  WarningProperties = Properties & {
    warning?: string
    label: string
    onApprove: DispatchWithoutAction
    onCancel: DispatchWithoutAction
    approveLabel: string
    cancelLabel: string
}

class Configuration extends Configurable<Properties> {
    visible = this.property(Boolean(this.defaultProperties?.visible))
}

export class ManagedDialog extends Widget<ManagedDialog, Properties, Configuration> implements Closable {
    #widget?: Widget<any>;
    #actions: Widget<any>[] = [];
    #actionsProps?: GridProps;

    useVisible = this.extract(configuration => configuration.visible);

    onClose = (action: DispatchWithoutAction) => this.useVisible(visible => visible.consume(value => value ? doNothing : action()));

    onOpen = (action: DispatchWithoutAction) => this.useVisible(visible => visible.consume(value => value ? action() : doNothing));

    open = () => this.useVisible(visible => visible.value = true);

    close = () => this.useVisible(visible => visible.value = false);

    visible = () => Boolean(this.configuration.visible);

    widget = (widget: Widget<any>) => {
        this.#widget = widget;
        return this;
    }

    action = (action: Widget<any>, props?: GridProps) => this.actions([action], props)

    actions = (actions: Widget<any>[], props?: GridProps) => {
        this.#actions = actions;
        this.#actionsProps = props;
        return this;
    }

    draw = () => {
        const title =
            <DialogTitle disableTypography>
                <Grid container justify={"space-between"} alignItems={"center"}>
                    <Grid item>
                        <Typography variant={"h6"} color={"primary"}>{this.properties.label}</Typography>
                    </Grid>
                    {this.#widget &&
                    <Grid item>
                        <IconButton onClick={() => this.configuration.visible.value = false}>
                            <CloseOutlined color={"primary"}/>
                        </IconButton>
                    </Grid>}
                </Grid>
            </DialogTitle>;

        const baseProperties = {...this.properties};
        delete baseProperties.label;
        delete baseProperties.fullWidth;
        delete baseProperties.fullScreen;
        delete baseProperties.visible;
        delete baseProperties.contentStyle;
        delete baseProperties.static;
        delete baseProperties.onKeyDown;
        return <div onKeyDown={this.properties.onKeyDown}>
            <Dialog {
                        ...{
                            ...baseProperties,
                            transitionDuration: DEFAULT_DIALOG_TRANSITION_TIMEOUT,
                            BackdropProps: {
                                style: {
                                    backgroundColor: DEFAULT_DIALOG_BACKDROP_COLOR
                                }
                            },
                            keepMounted: false,
                            onClose: () => this.configuration.visible.value = false,
                            maxWidth: this.properties.maxWidth == undefined
                                ? "sm"
                                : this.properties.maxWidth,
                            PaperComponent: this.properties.fullScreen || this.properties.static
                                ? undefined
                                : SimpleDraggablePaper,
                            fullWidth: this.properties.fullWidth,
                            fullScreen: this.properties.fullScreen,
                            open: this.configuration.visible.value
                        }
                    }>
                {title}
                {this.#widget &&
                <DialogContent style={this.properties.contentStyle} dividers>
                    {this.#widget.render()}
                </DialogContent>}
                {isNotEmptyArray(this.#actions) && <DialogActions style={{display: "block"}} disableSpacing>
                    <Grid container {...this.#actionsProps}>
                        {this.#actions.map((action, index) => <Grid key={index} item>{action.render()}</Grid>)}
                    </Grid>
                </DialogActions>}
            </Dialog>
        </div>;
    };
}

export const dialog = (properties?: Properties) => new ManagedDialog(properties, Configuration);

export const information = (properties: NotificationProperties) => {
    const okButton = button({
        label: properties.buttonLabel,
        fullWidth: true,
        variant: "outlined", color: "primary"
    });
    const informationDialog = dialog({
        label: properties.label,
        onKeyDown: handleEnter(okButton.click)
    })
    .widget(label({
        variant: "h6",
        align: "center",
        color: "secondary",
        text: properties.notification
    }))
    .action(okButton);
    okButton.useClick(click => click.handle(informationDialog.close));
    return informationDialog;
};

export const warning = (properties: WarningProperties) => {
    const approveButton = button({
        label: properties.approveLabel,
        variant: "contained", color: "primary"
    });

    const cancelButton = button({
        label: properties.cancelLabel,
        variant: "outlined", color: "secondary"
    });

    const warningDialog = properties.warning
        ? dialog({
            label: properties.label,
            onKeyDown: handleEnter(approveButton.click)
        })
        .widget(label({
            variant: "h6",
            align: "center",
            color: "secondary",
            text: properties.warning
        }))
        .actions([approveButton, cancelButton], {
            spacing: 1,
            alignItems: "center",
            justify: "flex-end"
        })
        : dialog({
            label: properties.label,
            onKeyDown: handleEnter(approveButton.click)
        })
        .actions([approveButton, cancelButton], {
            spacing: 1,
            alignItems: "center",
            justify: "flex-end",
            onKeyDown: handleEnter(approveButton.click)
        });

    approveButton.useClick(click => click.handle(() => {
        warningDialog.close();
        properties.onApprove();
    }));

    cancelButton.useClick(click => click.handle(() => {
        warningDialog.close();
        properties.onCancel();
    }));

    return warningDialog;
};
