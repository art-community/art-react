import {Checkbox, Accordion, AccordionDetails, AccordionProps, AccordionSummary, Grid, Radio, Typography} from "@material-ui/core";
import React, {Dispatch, DispatchWithoutAction, useRef} from "react";
import {Widget} from "../../widgets/Widget";
import {observe} from "../../pattern/Observable";
import ExpandMore from "@material-ui/icons/ExpandMore";
import {Configurable} from "../../pattern/Configurable";
import {event} from "../../pattern/Event";
import {Property} from "../../pattern/Property";
import {bigLoader} from "../simple/SimpleLoader";
import {DEFAULT_PANEL_TRANSITION_TIMEOUT, fromCheckEvent} from "../../constants/Constants";

type Properties = Omit<AccordionProps, "children"> & {
    label?: string
    labelColor?: "primary" | "secondary"
    wrapLabel?: boolean
    summaryLeftWidget?: Widget<any>
    summaryRightWidget?: Widget<any>
    lazy?: boolean
    persistent?: boolean
    reactOnCursor?: boolean
    expanded?: boolean
}

type RadioProperties = Omit<Properties, "reactOnCursor"> & {
    radio?: boolean
    checked?: boolean
}

type CheckboxProperties = Omit<Properties, "reactOnCursor"> & {
    checkbox?: boolean
    checked?: boolean
}

class Configuration extends Configurable<FullProperties> {
    expanded = this.property(this.defaultProperties.checked || this.defaultProperties.expanded);

    checked = this.property(this.defaultProperties.checked).consume(this.expanded.set);

    click = event();
}

type FullProperties = RadioProperties & CheckboxProperties & Properties;

export class ManagedPanel<T extends Widget<any>> extends Widget<ManagedPanel<T>, FullProperties, Configuration> implements BasePanelComponent<T>, CheckingPanelComponent<T> {
    #widget: T;

    #loader = bigLoader();

    constructor(widget: T, properties?: FullProperties) {
        super(properties, Configuration);
        this.#widget = widget;
        if (!this.properties.checkbox && !this.properties.radio) {
            return;
        }
        this.onClick(() => {
            const expanded = this.expanded();
            this.setChecked(true);
            this.setExpanded(!expanded)
        });
    }

    // @ts-ignore
    onExpansionChanged = (action: Dispatch<boolean>) => {
        this.configuration.expanded.consume(action)
        return this;
    }

    // @ts-ignore
    onCheck = (action: Dispatch<boolean>) => {
        this.configuration.checked.consume(action)
        return this;
    }

    widget = () => this.#widget;

    // @ts-ignore
    useClick = this.extract(configuration => configuration.click);

    // @ts-ignore
    onClick = (action: DispatchWithoutAction) => this.useClick(click => click.handle(action));


    useExpanded = this.extract(configuration => configuration.expanded);

    // @ts-ignore
    setExpanded = (value: boolean) => this.useExpanded(expanded => expanded.value = value);

    expanded = () => Boolean(this.configuration.expanded.value);

    // @ts-ignore
    expand = () => this.setExpanded(true);

    // @ts-ignore
    collapse = () => this.setExpanded(false);


    // @ts-ignore
    useChecked = this.extract(configuration => configuration.checked);

    // @ts-ignore
    setChecked = (value: boolean) => this.useChecked(checked => checked.value = value);

    checked = () => Boolean(this.configuration.checked.value);

    // @ts-ignore
    check = () => this.setChecked(true);

    // @ts-ignore
    uncheck = () => this.setChecked(false);

    draw = () => {
        const loaded = useRef(false);
        const checked = this.checked();
        const expanded = this.expanded();

        const radio = observe(checked).render(() =>
            <Grid item>
                <Radio checked={checked} onChange={fromCheckEvent(this.setChecked)} color={"primary"}/>
            </Grid>);

        const checkbox = observe(checked).render(() =>
            <Grid item>
                <Checkbox checked={checked} onChange={fromCheckEvent(this.setChecked)} color={"primary"}/>
            </Grid>);

        const label = this.properties.label &&
            <Grid item xs>
                <Typography noWrap={!this.properties.wrapLabel}
                            color={this.properties.labelColor || "secondary"}
                            variant="h6">
                    {this.properties.label}
                </Typography>
            </Grid>;

        const rightIcon = this.properties.summaryRightWidget &&
            <Grid item>
                <div onClick={event => event.stopPropagation()}>{this.properties.summaryRightWidget!.render()}</div>
            </Grid>;

        const leftIcon = this.properties.summaryLeftWidget &&
            <Grid item>
                <div onClick={event => event.stopPropagation()}>{this.properties.summaryLeftWidget!.render()}</div>
            </Grid>;

        const details = observe(loaded.current, expanded).render(() => {
            if (loaded.current) {
                return this.#widget.render()
            }
            if (expanded) {
                loaded.current = true;
                return this.#widget.render()
            }
            return this.#loader.render();
        });

        const baseProperties = {...this.properties};
        delete baseProperties.label;
        delete baseProperties.labelColor;
        delete baseProperties.wrapLabel;
        delete baseProperties.summaryRightWidget;
        delete baseProperties.summaryLeftWidget;
        delete baseProperties.lazy;
        delete baseProperties.persistent;
        delete baseProperties.reactOnCursor;
        delete baseProperties.checkbox;
        delete baseProperties.radio;
        delete baseProperties.checked;
        delete baseProperties.expanded;

        if (this.properties.radio || this.properties.checkbox) {
            return <Accordion
                {
                    ...{
                        ...baseProperties,
                        TransitionProps: {
                            unmountOnExit: !this.properties.persistent,
                            mountOnEnter: this.properties.lazy,
                            timeout: DEFAULT_PANEL_TRANSITION_TIMEOUT
                        },
                        expanded: expanded
                    }
                }>
                <AccordionSummary onClick={this.configuration.click.execute} expandIcon={<ExpandMore/>}>
                    <Grid container alignItems={"center"} wrap={"nowrap"} spacing={1}>
                        {leftIcon}
                        {this.properties.radio ? radio : checkbox}
                        {label}
                        {rightIcon}
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid item xs>
                        {details}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        }

        return <Accordion
            {
                ...{
                    ...baseProperties,
                    TransitionProps: {
                        unmountOnExit: !this.properties.persistent,
                        mountOnEnter: this.properties.lazy,
                        timeout: DEFAULT_PANEL_TRANSITION_TIMEOUT
                    },
                    expanded,
                    onChange: fromCheckEvent(this.setExpanded),
                    onTouchStart: () => this.properties.reactOnCursor && this.expand(),
                    onTouchEnd: () => this.properties.reactOnCursor && this.collapse(),
                    onMouseEnter: () => this.properties.reactOnCursor && this.expand(),
                    onMouseLeave: () => this.properties.reactOnCursor && this.collapse()
                }
            }>
            <AccordionSummary onClick={this.configuration.click.execute} expandIcon={<ExpandMore/>}>
                <Grid container alignItems={"center"} wrap={"nowrap"} justify={"flex-end"}>
                    {leftIcon}
                    {label}
                    {rightIcon}
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid item xs>
                    {details}
                </Grid>
            </AccordionDetails>
        </Accordion>;
    };
}

interface BasePanelComponent<T extends Widget<any>> extends Widget<BasePanelComponent<T>> {
    useClick: (user: (subject: Event) => any) => BasePanelComponent<T>;
    onClick: (action: DispatchWithoutAction) => BasePanelComponent<T>
    useExpanded: (user: (subject: Property<boolean | undefined>) => any) => ManagedPanel<T>
    setExpanded: (value: boolean) => BasePanelComponent<T>
    expanded: () => boolean
    expand: () => BasePanelComponent<T>
    collapse: () => BasePanelComponent<T>
    widget: () => T
    onExpansionChanged: (action: Dispatch<boolean>) => CheckingPanelComponent<T>
}

// @ts-ignore
interface CheckingPanelComponent<T extends Widget<any>> extends Widget<CheckingPanelComponent<T>>, BasePanelComponent<T> {
    useClick: (user: (subject: Event) => any) => CheckingPanelComponent<T>;
    onClick: (action: DispatchWithoutAction) => CheckingPanelComponent<T>
    useChecked: (user: (subject: Property<boolean | undefined>) => any) => CheckingPanelComponent<T>
    onCheck: (action: Dispatch<boolean>) => CheckingPanelComponent<T>
    setChecked: (value: boolean) => CheckingPanelComponent<T>
    checked: () => boolean
    check: () => CheckingPanelComponent<T>
    uncheck: () => CheckingPanelComponent<T>
    widget: () => T
}

export const panel = <T extends Widget<any>>(widget: T, properties?: Properties) =>
    new ManagedPanel<T>(widget, {lazy: true, persistent: false, ...properties}) as unknown as BasePanelComponent<T>;

export const radioPanel = <T extends Widget<any>>(widget: T, properties?: RadioProperties) =>
    new ManagedPanel<T>(widget, {lazy: true, persistent: false, radio: true, ...properties} as RadioProperties) as unknown as CheckingPanelComponent<T>;

export const checkBoxPanel = <T extends Widget<any>>(widget: T, properties?: CheckboxProperties) =>
    new ManagedPanel<T>(widget, {lazy: true, persistent: false, checkbox: true, ...properties} as CheckboxProperties) as unknown as CheckingPanelComponent<T>;
