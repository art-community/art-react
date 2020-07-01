import {CSSProperties, default as React, Dispatch} from "react";
import {Drawer, DrawerProps, useTheme} from "@material-ui/core";
import {Configurable} from "../../pattern/Configurable";
import {observe} from "../../pattern/Observable";
import {Widget} from "../../widgets/Widget";

type Properties = DrawerProps & {
    width: number
    expanded: boolean
}

const useStyle = (width: number, open?: boolean) => {
    const theme = useTheme();
    return observe(width, open, theme).render(() => ({
        drawer: open
            ? {
                flexShrink: 0,
                width: width,
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: 'hidden',
            }
            : {
                flexShrink: 0,
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                overflowX: 'hidden',
                width: theme.spacing(8) + 1
            },
    }));
};

class Configuration extends Configurable<Properties> {
    expanded = this.property(this.defaultProperties.expanded);
}

export class ManagedDrawer extends Widget<ManagedDrawer, Properties, Configuration> {
    #widget: Widget<any>;

    useExpanded = this.extract(configuration => configuration.expanded);

    onExpandChanged = (action: Dispatch<boolean>) => this.useExpanded(opened => opened.consume(action));

    setExpanded = (value: boolean) => {
        this.configuration.expanded.value = value;
        return this;
    };

    expand = () => {
        this.setExpanded(true);
        return this;
    };

    collapse = () => {
        this.setExpanded(false);
        return this;
    };

    constructor(widget: Widget<any>, properties?: Properties) {
        super(properties, Configuration);
        this.#widget = widget;
    }

    draw = () => {
        const style = useStyle(this.properties.width, this.configuration.expanded.value);
        const baseProperties = {...this.properties}
        delete baseProperties.width;
        delete baseProperties.expanded;
        return <Drawer {...baseProperties}
                       onTouchStart={() => this.configuration.expanded.value = true}
                       onTouchEnd={() => this.configuration.expanded.value = false}
                       onMouseEnter={() => this.configuration.expanded.value = true}
                       onMouseLeave={() => this.configuration.expanded.value = false}
                       open
                       variant="persistent"
                       PaperProps={{style: style.drawer as CSSProperties}}
                       style={style.drawer as CSSProperties}>
            {this.#widget.render()}
        </Drawer>;
    }
}

export const drawer = (widget: Widget<any>, properties?: Properties) => new ManagedDrawer(widget, properties);
