import {Configurable} from "../../pattern/Configurable";
import equal from "fast-deep-equal";
import {Widget} from "../../widgets/Widget";
import {Tab, Tabs, TabsProps, Typography} from "@material-ui/core";
import {fromTabChangeEvent} from "../../constants/Constants";
import React, {Dispatch} from "react";

type Properties = Omit<TabsProps, "value"> & {
    labels: string[]
    selected?: string
}

class Configuration extends Configurable<Properties> {
    selected = this.property(Math.max(this.defaultProperties.labels.findIndex(label => equal(label, this.defaultProperties.selected)), 0))
}

export class ManagedTabs extends Widget<ManagedTabs, Properties, Configuration> {
    draw = () => {
        const baseProperties = {...this.properties};
        delete baseProperties.labels;
        delete baseProperties.selected;
        return <Tabs {
                         ...{
                             ...baseProperties,
                             value: this.configuration.selected.value,
                             onChange: fromTabChangeEvent(this.configuration.selected.set)
                         }
                     }>
            {this.properties.labels.map((label, index) =>
                <Tab {
                         ...{
                             key: index,
                             value: index,
                             label: <Typography noWrap
                                                color={"secondary"}
                                                style={{
                                                    textTransform: "none",
                                                    width: "100%",
                                                    textOverflow: "unset"
                                                }}
                                                variant={"h5"}>
                                 {label}
                             </Typography>,
                             style: {
                                 minWidth: "fit-content"
                             }
                         }
                     }
                />)
            }
        </Tabs>;
    }

    onSelect = (action: Dispatch<string>) => {
        this.configuration.selected.consume(index => action(this.properties.labels[index]))
        return this;
    }

    selected = () => this.configuration.selected.value;
}

export const tabs = (properties: Properties) => new ManagedTabs(properties, Configuration);
