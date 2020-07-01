import {Tab, TabProps, Typography} from "@material-ui/core";
import React from "react";
import {Widget} from "../../widgets/Widget";

type Properties = TabProps & {
    label: string
}

export class SimpleTab extends Widget<SimpleTab, Properties> {
    draw = () => {
        const baseProperties = {...this.properties};
        delete baseProperties.label;
        return <Tab {
                        ...{
                            ...baseProperties,
                            label: <Typography noWrap
                                               color={"secondary"}
                                               style={{
                                                   textTransform: "none",
                                                   width: "100%",
                                                   textOverflow: "unset"
                                               }}
                                               variant={"h5"}>
                                {this.properties?.label}
                            </Typography>,
                            style: {minWidth: "fit-content"}
                        }
                    }
        />;
    }
}

export const tab = (properties: Properties) => new SimpleTab(properties);
