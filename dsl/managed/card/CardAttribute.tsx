import React from "react";
import {Grid, Link, Typography} from "@material-ui/core";
import {Widget} from "../../../widgets/Widget";
import {hashOf} from "../../../extensions/HashExtensions";
import {BLANK} from "../../../constants/Constants";

export type CardAttributeProperties = {
    value?: string
    link?: boolean
    boolean?: boolean
    name?: string
    column?: boolean
    icon?: Widget<any>
    custom?: Widget<any>
}

class CardAttribute extends Widget<CardAttribute, CardAttributeProperties> {
    key = () => hashOf([
        this.properties.value,
        this.properties.link,
        this.properties.boolean,
        this.properties.name,
        this.properties.column,
        this.properties.icon?.key,
        this.properties.custom?.key,
    ]);

    constructor(properties: CardAttributeProperties) {
        super(properties);
        this.widgetName = properties.name ? `(${this.widgetName}) ${properties.name}` : this.widgetName;
    }

    draw = () => {
        const {boolean, column, custom, icon, link, name, value} = this.properties;

        if (custom) {
            return custom!.render();
        }

        if (!name) {
            return <></>;
        }

        return <Grid key={name}
                     alignItems={column ? "flex-start" : "center"}
                     container
                     spacing={1}
                     direction={column ? "column" : "row"}
                     wrap={"nowrap"}>
            <Grid item>
                <Typography noWrap color={"secondary"}>{
                    name + (boolean ? "" : ":")}
                </Typography>
            </Grid>
            {icon && <Grid item>{icon!.render()}</Grid>}
            {
                value && <Grid item>
                    {
                        link
                            ? <Link noWrap target={BLANK} color={"primary"} href={value}>
                                {value}
                            </Link>
                            : <Typography noWrap align={"right"} color={"primary"}>
                                {value}
                            </Typography>
                    }
                </Grid>
            }
        </Grid>;
    }
}

export const cardAttribute = (properties: CardAttributeProperties) => new CardAttribute(properties);
