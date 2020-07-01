import {TextField, Typography, TypographyProps, useTheme} from "@material-ui/core";
import {observe} from "../../pattern/Observable";
import {label} from "./ManagedLabel";
import {Widget} from "../../widgets/Widget";
import {Configurable} from "../../pattern/Configurable";
import equal from "fast-deep-equal";
import {Property} from "../../pattern/Property";
import {proxy} from "../../widgets/Proxy";
import React, {Dispatch, useRef} from "react";
import {isJsx, isString, isWidget} from "../../extensions/Determiners";
import Autocomplete, {AutocompleteProps, AutocompleteRenderInputParams} from "@material-ui/lab/Autocomplete";
import {DEFAULT_SELECTOR_WIDTH, fromSearcherEvent} from "../../constants/Constants";
import {isEmptyArray} from "../../extensions/extensions";

type LabelProperties = {
    text: string
    properties?: TypographyProps
}

type SelectorItemWidget = Widget<any> | string | JSX.Element;

type SelectorItemProperties<T extends any> = {
    value: T,
    suggestion: string
    option: SelectorItemWidget
    inputTextColor?: "primary" | "secondary"
    icon?: Widget<any>
};

type ItemFactory<T extends any> = (item: T) => SelectorItemProperties<T>;

type Properties<T> = Omit<Omit<AutocompleteProps<any, any, any, any>, "renderInput">, "options"> & {
    itemFactory: ItemFactory<T>
    available: T[]
    disabled?: boolean
    label?: LabelProperties | string
    selected?: T
}

const useStyle = (minWidth: string | number) => {
    const theme = useTheme();
    return observe(minWidth, theme).render(() => ({
        selector: {minWidth}
    }));
};

class SelectorItem<T> extends Widget<SelectorItem<T>> {
    #index: number;
    #widget: Widget<any>;
    #value: T;
    #suggestion: string;
    #icon?: Widget<any>;
    #inputTextColor?: "primary" | "secondary"

    constructor(index: number, widget: Widget<any>, properties: SelectorItemProperties<T>) {
        super();
        this.#index = index;
        this.#widget = widget;
        this.#icon = properties.icon;
        this.#value = properties.value;
        this.#suggestion = properties.suggestion;
        this.#inputTextColor = properties.inputTextColor;
    }

    get value() {
        return this.#value;
    }

    get suggestion() {
        return this.#suggestion;
    }

    get inputTextColor() {
        return this.#inputTextColor;
    }

    get renderIcon() {
        return this.#icon?.render() || <></>;
    }

    draw = () => this.#widget.render();

    render = this.draw;
}

class Configuration<T extends any> extends Configurable<Properties<T>> {
    #availableItems: SelectorItem<T>[] = [];

    #addItem = (item: SelectorItemProperties<T>) => {
        if (isString(item.option)) {
            const selectorItem = new SelectorItem<T>(this.#availableItems.length, label({text: item.option}), item);
            this.#availableItems.push(selectorItem);
            return this;
        }
        if (isWidget(item.option)) {
            const selectorItem = new SelectorItem<T>(this.#availableItems.length, item.option, item);
            this.#availableItems.push(selectorItem);
            return this;
        }
        if (isJsx(item.option)) {
            const selectorItem = new SelectorItem<T>(this.#availableItems.length, proxy(item.option), item);
            this.#availableItems.push(selectorItem);
            return this;
        }
        return this;
    };

    selectedIndex: Property<number>;

    selected: Property<T>

    disabled = this.property(Boolean(this.defaultProperties.disabled));

    constructor(widget: Widget<any>, properties: Properties<T>) {
        super(widget, properties);

        if (isEmptyArray(properties.available)) {
            throw Error("Selector should have at least one available value")
        }

        properties.available.forEach(value => this.#addItem(properties.itemFactory(value)))

        this.selected = this.property<T>(properties.selected == undefined ? properties.available[0] : properties.selected as T)
        .consume(value => {
            const index = Math.max(this.#availableItems.findIndex(item => equal(item.value, value)), 0);
            if (this.selectedIndex.value == index) {
                return
            }
            this.selectedIndex.value = index;
        });

        const index = () => Math.max(this.#availableItems!.findIndex(item => equal(item.value, properties.selected)), 0);

        this.selectedIndex = this.property(properties.selected && properties.available ? index() : 0)
        .consume(index => this.selected.value = this.#availableItems[index].value)
    }

    get items() {
        return this.#availableItems;
    }

    setAvailableValues = (values: T[]) => {
        this.pauseRender()
        this.#availableItems = [];
        values.forEach(value => this.#addItem(this.defaultProperties.itemFactory(value)));
        const selected = this.selected.value;
        if (selected == undefined) {
            this.selectedIndex.value = 0;
            this.selected.value = values[0];
            this.continueRender()
            return;
        }
        const index = Math.max(values.findIndex(value => equal(value, selected)), 0);
        if (this.selectedIndex.value == index) {
            this.selected.value = values[index];
            this.continueRender()
            return;
        }
        this.selectedIndex.value = index;
        this.continueRender()
    };

    findItem = (suggestion: string) => this.#availableItems.find(item => item.suggestion == suggestion);

    findItemIndex = (suggestion: string) => this.#availableItems.findIndex(item => item.suggestion == suggestion);

    selectItem = (suggestion: string) => this.selectedIndex.value = Math.max(this.#availableItems.findIndex(item => item.suggestion == suggestion), 0)
}

export class ManagedSelector<T extends any> extends Widget<ManagedSelector<T>, Properties<T>, Configuration<T>> {
    #theme = this.hookValue(useTheme);

    #renderInput = (params: AutocompleteRenderInputParams) => {
        const label = isString(this.properties.label)
            ? this.properties.label
            : <Typography {...this.properties.label!.properties} variant={"inherit"}>{this.properties.label!.text}</Typography>;
        const theme = this.#theme()
        const color = this.configuration.items[this.configuration.selectedIndex.value].inputTextColor == undefined
            ? undefined
            : this.configuration.items[this.configuration.selectedIndex.value].inputTextColor == "primary"
                ? theme.palette.primary.main
                : theme.palette.secondary.main;
        const startAdornment = this.configuration.items[this.configuration.selectedIndex.value].renderIcon;
        return <TextField {...{...params, label}}
                          InputProps={{...params.InputProps, startAdornment}}
                          inputProps={{...params.inputProps, style: {color}}}
                          variant="outlined"
                          placeholder={this.properties.placeholder}/>;
    };

    #renderOption = (option: string) => this.configuration.findItem(option)!.render();

    useSelectedIndex = this.extract(configuration => configuration.selectedIndex);

    selectedIndex = () => this.configuration.selectedIndex.value;

    selectIndex = (index: number) => this.useSelectedIndex(selected => selected.value = index);

    useSelected = (user: (subject: Property<T>) => any) => {
        this.extract(configuration => configuration.selected)(user);
        return this;
    };

    onSelect = (action: Dispatch<T>) => this.useSelected(selected => selected.consume(action));

    selected = () => this.configuration.selected.value as T;

    select = (value?: T) => {
        if (value == undefined) {
            return this;
        }
        this.lock(() => this.useSelected(selected => selected.value = value));
        return this;
    };

    useDisabled = this.extract(configuration => configuration.disabled);

    disabled = () => Boolean(this.configuration.disabled.value);

    setDisabled = (value: boolean) => this.useDisabled(disabled => disabled.value = value);

    disable = () => this.setDisabled(true);

    enable = () => this.setDisabled(false);

    setAvailableValues = (values: T[]) => {
        this.configuration.setAvailableValues(values);
        return this;
    };

    reset = () => this.selectIndex(0);

    draw = () => {
        const labelReference = useRef<HTMLLabelElement>(null);
        const offsetWidth = !this.properties.label ? 0 : labelReference.current?.offsetWidth || DEFAULT_SELECTOR_WIDTH;
        const style = useStyle(offsetWidth);
        const value = this.configuration.items[this.configuration.selectedIndex.value].suggestion;
        const options = this.configuration.items.map(item => item.suggestion);
        const baseProperties = {...this.properties};
        delete baseProperties.label;
        delete baseProperties.selected;
        delete baseProperties.available;
        delete baseProperties.itemFactory;

        return <Autocomplete
            {
                ...{
                    ...baseProperties,
                    disabled: this.configuration.disabled.value,
                    value,
                    options,
                    disableListWrap: true,
                    disableClearable: true,
                    getOptionLabel: (label: string) => label,
                    onChange: fromSearcherEvent(this.configuration.selectItem),
                    renderInput: this.#renderInput,
                    renderOption: this.#renderOption,
                    noOptionsText: "Совпадений не найдено",
                    style: style.selector
                }
            }/>;
    }
}

export const selector = <T extends any>(properties?: Properties<T>) => new ManagedSelector<T>(properties, Configuration);

export const selectorItem = <T extends any>(properties: SelectorItemProperties<T>) => properties;
