import React, {Dispatch, Key} from "react";
import {Grid, GridProps} from "@material-ui/core";
import {GridSize} from "@material-ui/core/Grid/Grid";
import {Breakpoint} from "@material-ui/core/styles/createBreakpoints";
import {Widget} from "../../widgets/Widget";
import {Configurable} from "../../pattern/Configurable";
import equal from "fast-deep-equal";
import {isEmptyArray, isNotEmptyArray} from "../../extensions/extensions";

type BreakpointType = Partial<Record<Breakpoint, boolean | GridSize>>;

type GridItemProperties = GridProps

class GridItem extends Widget<GridItem> {
    #key: Key
    #breakpoints?: BreakpointType = {};

    readonly widget: Widget<any>;

    constructor(widget: Widget<any>, key?: Key, properties?: GridItemProperties) {
        super(properties);
        this.widget = widget;
        this.#key = key == undefined ? widget.key() : key;
        this.widgetName = `(${this.widgetName}) ${widget.widgetName}`;
    }

    breakpoints = (breakpoint: BreakpointType) => {
        this.#breakpoints = {...this.#breakpoints, ...breakpoint};
        return this;
    };

    key = () => this.#key;

    draw = () =>
        <Grid
            {...
                {
                    ...this.properties,
                    ...this.#breakpoints,
                    item: true
                }
            }>
            {this.widget.render()}
        </Grid>;
}

class Configuration extends Configurable<GridProps> {
    keys = this.property<Key[]>([]);
}

export class ManagedGrid extends Widget<ManagedGrid, GridProps, Configuration> {
    #items: GridItem[] = [];
    #breakpoints: BreakpointType = {};

    useKeys = this.extract(configuration => configuration.keys)


    breakpoints = (breakpoints: BreakpointType) => {
        this.#breakpoints = breakpoints;
        return this;
    };


    unshiftWidget = (widget: Widget<any>, properties?: GridProps, decorator?: (item: GridItem) => GridItem) => {
        if (!decorator) {
            this.#items.unshift(new GridItem(widget, widget.key(), properties).breakpoints(this.#breakpoints));
            this.configuration.keys.value = [widget.key(), ...this.configuration.keys.value];
            return this
        }
        this.#items.unshift(decorator(new GridItem(widget, widget.key(), properties).breakpoints(this.#breakpoints)));
        this.configuration.keys.value = [widget.key(), ...this.configuration.keys.value];
        return this
    }

    removeWidget = (widget: Widget<any>) => this.removeKey(widget.key());

    pushWidget = (widget: Widget<any>, properties?: GridProps, decorator?: (item: GridItem) => GridItem) => {
        if (!decorator) {
            this.#items.push(new GridItem(widget, widget.key(), properties).breakpoints(this.#breakpoints));
            this.configuration.keys.value = [...this.configuration.keys.value, widget.key()];
            return this
        }
        this.#items.push(decorator(new GridItem(widget, widget.key(), properties).breakpoints(this.#breakpoints)));
        this.configuration.keys.value = [...this.configuration.keys.value, widget.key()];
        return this
    }

    pushWidgets = (widgets: Widget<any>[], properties?: GridItemProperties) => {
        widgets.forEach(widget => this.#items.push(new GridItem(widget, widget.key(), properties).breakpoints(this.#breakpoints)));
        this.configuration.keys.value = [...this.configuration.keys.value, ...widgets.map(widget => widget.key())]
        return this
    };

    unshiftWidgets = (widgets: Widget<any>[], properties?: GridItemProperties) => {
        widgets.forEach(widget => this.#items.unshift(new GridItem(widget, widget.key(), properties).breakpoints(this.#breakpoints)));
        this.configuration.keys.value = [...widgets.map(widget => widget.key()), ...this.configuration.keys.value]
        return this
    };

    replaceWidget = (widget: Widget<any>) => {
        this.lock(() => {
            this.removeKey(widget.key())
            this.pushWidget(widget)
        })
        return this
    }

    arrangeWidgets = (keys: Key[]) => {
        const current = this.widgets();
        this.setWidgets(keys.map(key => current.find(widget => equal(widget.key(), key))).filter(widget => widget != undefined).map(widget => widget!))
        return this
    }

    getWidgetByIndex = <T extends Widget<any>>(index: number) => this.getItemByIndex(index)?.widget as T

    getWidgetByKey = <T extends Widget<any>>(key: Key) => this.getItemByKey(key)?.widget as T

    setWidgets = (widgets: Widget<any>[]) => {
        this.lock(() => {
            this.#items = []
            this.configuration.keys.value = []
            this.pushWidgets(widgets)
        })
        return this;
    }

    hasWidget = (widget: Widget<any>) => this.hasKey(widget.key())

    widgets = () => this.#items.map(item => item.widget)


    unshiftItem = (item: GridItem) => {
        this.#items.unshift(item.breakpoints(this.#breakpoints));
        this.configuration.keys.value = [item.key(), ...this.configuration.keys.value];
        return this
    }

    removeItem = (item: GridItem) => this.removeWidget(item.widget)

    pushItem = (item: GridItem) => {
        this.#items.push(item.breakpoints(this.#breakpoints));
        this.configuration.keys.value = [...this.configuration.keys.value, item.key()];
        return this
    }

    pushItems = (items: GridItem[]) => {
        this.#items = [...this.#items, ...items];
        this.configuration.keys.value = [...this.configuration.keys.value, ...items.map(item => item.key())]
        return this
    };

    replaceItem = (item: GridItem) => {
        this.lock(() => {
            this.removeKey(item.key())
            this.pushItem(item)
        })
        return this
    }

    getItemByIndex = (index: number) => this.#items[index]

    getItemByKey = (key: Key) => this.#items.find(item => item.key() == key)

    setItems = (items: GridItem[]) => {
        this.lock(() => {
            this.#items = []
            this.configuration.keys.value = []
            this.pushItems(items)
        })
        return this;
    }

    hasItem = (item: GridItem) => this.hasWidget(item.widget)

    items = () => this.#items;


    removeIndex = (index: number) => {
        this.#items = this.#items.filter((_, itemIndex) => itemIndex != index)
        this.configuration.keys.value = this.configuration.keys.value.filter((_, keyIndex) => keyIndex != index)
        return this;
    }

    removeKey = (key: Key) => {
        const index = this.configuration.keys.value!.findIndex(current => equal(current, key));
        if (index == -1) {
            return this;
        }
        return this.removeIndex(index)
    }

    hasKey = (key: Key) => this.configuration.keys.value.has(key)

    hasIndex = (index: number) => this.configuration.keys.value[index] != undefined

    keysChanged = (action: Dispatch<Key[]>) => this.useKeys(keys => keys.consume(action));

    keys = () => this.configuration.keys.value || [];


    isEmpty = () => isEmptyArray(this.configuration.keys.value);

    isNotEmpty = () => isNotEmptyArray(this.configuration.keys.value);

    length = () => this.configuration.keys.value?.length || 0;

    clear = () => {
        this.#items = [];
        this.configuration.keys.value = [];
        return this;
    }

    filter = (filter: (key: Key) => boolean) => {
        const grid = new ManagedGrid(this.properties, Configuration);
        grid.pushWidgets(this.keys().filter(filter).map(key => this.getWidgetByKey(key)))
        return grid;
    }

    draw = () =>
        <Grid
            {...
                {

                    ...this.properties,
                    container: true,
                    alignContent: this.properties?.alignContent,
                    alignItems: this.properties?.alignItems,
                    justify: this.properties?.justify,
                    spacing: this.properties?.spacing,
                    wrap: this.properties?.wrap,
                    direction: this.properties?.direction
                }
            }>
            {this.#items.map(item => item.render())}
        </Grid>
}

export const grid = (properties?: GridProps) => new ManagedGrid(properties, Configuration);

export const horizontalGrid = (properties?: GridProps) => grid({...properties, direction: "row"});

export const verticalGrid = (properties?: GridProps) => grid({...properties, direction: "column"});

export const gridItem = (widget: Widget<any>, key?: Key, properties?: GridItemProperties) => new GridItem(widget, key, properties);
