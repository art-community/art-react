import {Link, Typography, TypographyProps} from "@material-ui/core";
import React from "react";
import {Widget} from "../../widgets/Widget";
import {BLANK} from "../../constants/Constants";

type Properties = TypographyProps & {
    label: string
    reference: string
    target?: string
    description?: string
}

export class SimpleLink extends Widget<SimpleLink, Properties> {
    draw = () => {
        if (!this.properties?.description) {
            return <Link color={"secondary"}
                         href={this.properties?.reference}
                         target={this.properties?.target || BLANK}>
                {this.properties?.label}
            </Link>
        }

        return <Typography {...this.properties}>
            <Link color={"secondary"}
                  href={this.properties?.reference}
                  target={this.properties?.target || BLANK}>{this.properties?.label}
            </Link>: {this.properties?.description}
        </Typography>;
    };
}

export const link = (properties: Properties) => new SimpleLink(properties);
