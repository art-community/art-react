import {Card, CardContent, CardHeader, CardProps, Accordion, AccordionDetails, AccordionSummary, Grid, Typography} from "@material-ui/core";
import React, {Dispatch} from "react";
import ExpandMore from "@material-ui/icons/ExpandMore";
import {Widget} from "../../../widgets/Widget";
import {Configurable} from "../../../pattern/Configurable";
import {CardAvatar, cardAvatar} from "./CardAvatar";
import {cardAttribute, CardAttributeProperties} from "./CardAttribute";
import {CardMenu, cardMenu} from "./CardMenu";
import {isNotEmptyArray} from "../../../extensions/extensions";
import {DEFAULT_PANEL_TRANSITION_TIMEOUT, fromCheckEvent} from "../../../constants/Constants";
import {Render} from "../../../pattern/Render";

type Properties = Omit<CardProps, "children"> & {
    label?: string
    background?: string
    lazy?: boolean
    persistent?: boolean
    panel?: boolean
    expanded?: boolean
}

class Configuration extends Configurable<Properties> {
    label = this.property(this.defaultProperties.label);

    background = this.property(this.defaultProperties.background)

    attributes = this.property<CardAttributeProperties[]>([]);

    expanded = this.property(this.defaultProperties.expanded)
}

export class ManagedCard extends Widget<ManagedCard, Properties, Configuration> {
    #body?: Widget<any>;

    #avatar = cardAvatar();

    #menu = cardMenu();

    constructor(properties?: Properties, body?: Widget<any>) {
        super(properties, Configuration);
        this.#body = body;
    }


    useLabel = this.extract(configuration => configuration.label);

    setLabel = (label: string) => this.useLabel(property => property.value = label);

    label = () => this.configuration.label.value;


    useAttributes = this.extract(configuration => configuration.attributes);

    setAttributes = (attributes: CardAttributeProperties[]) => {
        this.useAttributes(property => property.value = attributes);
        return this;
    };

    updateAttributes = (decorator: (current: CardAttributeProperties[]) => CardAttributeProperties[]) => {
        this.useAttributes(property => property.value = decorator(property.value));
        return this;
    };

    updateAttribute = (identifier: number | string, decorator: (current?: CardAttributeProperties) => CardAttributeProperties) => {
        if (typeof identifier == "number") {
            this.updateAttributes(attributes => {
                const current = [...attributes];
                current[identifier] = decorator(current[identifier]);
                return current;
            });
            return this;
        }
        this.updateAttributes(attributes => {
            const current = [...attributes];
            const index = current.findIndex(attribute => attribute.name == identifier);
            if (index == -1) return current;
            current[index] = decorator(current[index]);
            return current;
        });
        return this;
    };

    addAttribute = (attribute: CardAttributeProperties) => {
        this.setAttributes([...this.configuration.attributes.value, attribute]);
        return this;
    };


    useExpanded = this.extract(configuration => configuration.expanded)

    expanded = () => Boolean(this.configuration.expanded.value)

    onExpansionChanged = (action: Dispatch<boolean>) => {
        this.configuration.expanded.consume(action)
        return this;
    }

    setBackground = (background: string) => {
        this.configuration.background.value = background;
        return this;
    }

    configureMenu = (configurator: (menu: CardMenu) => CardMenu) => {
        this.#menu = configurator(this.#menu)
        return this;
    }

    configureAvatar = (configurator: (avatar: CardAvatar) => CardAvatar) => {
        this.#avatar = configurator(this.#avatar)
        return this;
    }

    draw = () => {
        const expanded = this.configuration.expanded.value;

        const attributes =
            <Grid container direction={"column"}>
                <Grid item>
                    <Grid container direction={"column"} spacing={1}>
                        {
                            this.configuration.attributes.value!.map((attribute, index) =>
                                <Grid key={index} item>
                                    {<Render factory={cardAttribute(attribute).render}/>}
                                </Grid>
                            )
                        }
                    </Grid>
                </Grid>
                <Grid item>
                    {this.#body}
                </Grid>
            </Grid>;

        const panel =
            <Accordion
                TransitionProps={{
                    unmountOnExit: !this.properties.persistent,
                    mountOnEnter: this.properties.lazy,
                    timeout: DEFAULT_PANEL_TRANSITION_TIMEOUT
                }}
                onChange={fromCheckEvent(this.configuration.expanded.set)}
                expanded={Boolean(expanded)}>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography color={"primary"} noWrap>Подробности</Typography>
                </AccordionSummary>
                <CardContent>
                    <AccordionDetails>
                        {attributes}
                    </AccordionDetails>
                </CardContent>
            </Accordion>;

        const baseProperties = {...this.properties};
        delete baseProperties.lazy;
        delete baseProperties.persistent;
        delete baseProperties.label;
        delete baseProperties.background;
        delete baseProperties.panel;
        delete baseProperties.expanded;

        return <Card {...baseProperties}>
            <CardHeader
                avatar={<Render factory={this.#avatar.render}/>}
                action={<Render factory={this.#menu.render}/>}
                title={<Typography color={"primary"} variant={"h6"}>{this.configuration.label.value}</Typography>}/>
            {isNotEmptyArray(this.configuration.attributes.value) && this.properties.panel ? panel : <CardContent>{attributes}</CardContent>}
        </Card>
    }
}

export const card = (properties?: Properties, body?: Widget<any>) =>
    new ManagedCard({lazy: true, persistent: true, panel: true, ...properties}, body);
