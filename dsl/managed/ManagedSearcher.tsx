import {ChipProps, TextField, Typography, TypographyProps, useTheme} from "@material-ui/core";
import {observe} from "../../pattern/Observable";
import {Widget} from "../../widgets/Widget";
import {Configurable} from "../../pattern/Configurable";
import {Property} from "../../pattern/Property";
import {proxy} from "../../widgets/Proxy";
import React, {CSSProperties, Dispatch, useRef} from "react";
import {isJsx, isString, isWidget} from "../../extensions/Determiners";
import {AutocompleteGetTagProps, AutocompleteProps, AutocompleteRenderInputParams} from "@material-ui/lab/Autocomplete/Autocomplete";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {checkbox} from "./ManagedCheckbox";
import {chip} from "../simple/SimpleChip";
import {label} from "./ManagedLabel";
import {Render} from "../../pattern/Render";
import equal from "fast-deep-equal";
import {DEFAULT_SELECTOR_WIDTH, fromSearcherEvent} from "../../constants/Constants";
import {isEmptyArray} from "../../extensions/extensions";

type WidgetType = Widget<any> | string | JSX.Element | undefined;

type TagType = {
    widget?: WidgetType,
    chipped?: boolean
    chipProperties?: ChipProps
    labelProperties?: TypographyProps
}

type LabelProperties = {
    text: string
    properties?: TypographyProps
}

type ItemFactory<T extends any> = (item: T) => SearcherItemProperties<T>;

type SearcherItemProperties<T extends any> = {
    value: T,
    suggestion: string,
    option?: WidgetType
    tag?: TagType
    selected?: boolean
};


type Properties<T extends any> = Omit<Omit<AutocompleteProps<any, any, any, any>, "renderInput">, "options"> & {
    itemFactory: ItemFactory<T>;
    available: T[]
    disabled?: boolean
    label?: string | LabelProperties
    selected?: T[]
    comparator?: (current: T, other: T) => boolean
}

const useStyle = (minWidth: number | string, disabled?: boolean) => {
    const theme = useTheme();
    return observe(disabled, theme, minWidth).render(() => ({
        chip: {
            margin: 5,
            height: "unset",
            boxShadow: `0 0 7px ${theme.palette.secondary.main}`,
            border: `1px solid ${theme.palette.secondary.main}`,
            background: theme.palette.background.default,
            color: theme.palette.primary.main
        },
        searcher: {minWidth}
    }));
};

class SearcherItem<T> {
    #option: Widget<any>;
    #tag: Widget<any>;
    #value: T;
    #suggestion: string;

    constructor(value: T, suggestion: string, option: Widget<any>, tag: Widget<any>) {
        this.#value = value;
        this.#suggestion = suggestion;
        this.#option = option;
        this.#tag = tag;
    }

    get value() {
        return this.#value;
    }

    get option() {
        return this.#option;
    }

    get tag() {
        return this.#tag;
    }

    get suggestion() {
        return this.#suggestion;
    }
}

class Configuration<T extends any> extends Configurable<Properties<T>> {
    #availableItems: SearcherItem<T>[] = [];

    constructor(widget: Widget<any>, properties: Properties<T>) {
        super(widget, properties);

        const comparator = properties.comparator || equal;

        const indexes = properties.selected?.map(value => properties.available
            ?.findIndex(item => comparator(item, value)))
            ?.filter(index => index != undefined && index != -1)
            ?.map(index => index!)
            || [] as number[];

        this.selectedIndexes = this.property<number[]>(indexes)
        .consume(indexes => this.selected.value = indexes.map(index => this.#availableItems[index].value).filter(value => value != undefined));

        this.selected = this.property<T[]>(properties.selected ? [...properties.selected] : [])
        .consume(values => {
            const indexes: number[] = [];
            for (let index = 0; index < this.#availableItems.length; index++) {
                const item = this.#availableItems[index];
                if (values.some(value => comparator(item.value, value))) {
                    indexes.push(index);
                }
            }
            this.selectedIndexes.value = indexes;
        });

        this.#availableItems = properties.available
        .map((value, index) => this.createItem({selected: indexes.includes(index), ...properties.itemFactory(value)}));
    }

    get items() {
        return this.#availableItems;
    }

    disabled = this.property(Boolean(this.defaultProperties.disabled));

    selectedIndexes: Property<number[]>

    selected: Property<T[]>

    findItem = (suggestion: string) => this.#availableItems.find(item => item.suggestion == suggestion);

    findItemIndex = (suggestion: string) => this.#availableItems.findIndex(item => item.suggestion == suggestion);

    selectItems = (suggestions: string[]) => this.selectedIndexes.value = suggestions.map(this.findItemIndex).filter(index => index != -1)

    setAvailableValues = (values: T[]) => {
        const comparator = this.defaultProperties.comparator || equal;
        const selectedValues = [...this.selected.value];

        this.#availableItems = values
        .map(value => this.createItem({selected: selectedValues.has(value), ...this.defaultProperties.itemFactory(value)}));

        this.pauseRender();
        this.selectedIndexes.value = selectedValues
        .map(value => this.#availableItems.findIndex(item => comparator(item.value, value)))
        .filter(index => index != -1)
        this.continueRender();
    };

    createItem = (item: SearcherItemProperties<T>) => {
        const drawableOption = this
        .#optionOf(item.suggestion, item.option, item.selected)
        .useChecked(checked => this.selectedIndexes.consume(indexes => checked.value = Boolean(this.#itemIsSelected(indexes, item.suggestion))));

        const drawableTag = this.#tagOf(item.suggestion, item.tag || {widget: item.suggestion});

        return new SearcherItem<T>(item.value, item.suggestion, drawableOption, drawableTag);
    };

    #itemIsSelected = (indexes: number[], suggestion: string) => indexes.some(index => this.#availableItems[index]?.suggestion == suggestion);

    #optionOf = (suggestion: string, widget: WidgetType, checked?: boolean) => {
        if (widget == undefined) {
            return checkbox({label: suggestion, checked});
        }
        if (isWidget(widget)) {
            return checkbox({label: widget, checked});
        }
        if (isString(widget)) {
            return checkbox({label: widget, checked});
        }
        if (isJsx(widget)) {
            return checkbox({label: proxy(widget), checked});
        }
        throw new Error(`Unknown component type: ${typeof widget}`)
    };

    #tagOf = (suggestion: string, tag: TagType): Widget<any> => {
        if (tag.widget == undefined) {
            return tag.chipped
                ? chip({label: <Typography {...tag.labelProperties}>{suggestion}</Typography>, ...tag.chipProperties})
                : label({text: suggestion, ...tag.labelProperties});
        }
        if (isWidget(tag.widget)) {
            return tag.chipped
                ? chip({label: tag.widget!.render(), ...tag.chipProperties})
                : proxy(
                    <Typography key={suggestion} {...tag.labelProperties} >
                        {tag.widget!.render()}
                    </Typography>
                )
        }
        if (isString(tag.widget)) {
            return tag.chipped
                ? chip({
                    label: <Typography {...tag.labelProperties}>{tag.widget}</Typography>,
                    ...tag.chipProperties
                })
                : label({text: tag.widget, ...tag.labelProperties});
        }
        if (isJsx(tag.widget)) {
            return tag.chipped
                ? chip({label: tag.widget, ...tag.chipProperties})
                : proxy(
                    <Typography key={suggestion} {...tag.labelProperties}>
                        {tag.widget}
                    </Typography>
                )
        }
        throw new Error(`Unknown component type: ${typeof tag.widget}`)
    }
}

export class ManagedSearcher<T extends any> extends Widget<ManagedSearcher<T>, Properties<T>, Configuration<T>> {
    useSelectedIndex = this.extract(configuration => configuration.selectedIndexes);

    selectedIndexes = () => this.configuration.selectedIndexes.value;

    selectIndexes = (indexes: number[]) => this.useSelectedIndex(selected => selected.value = indexes);


    useDisabled = this.extract(configuration => configuration.disabled);

    setDisabled = (value: boolean) => this.useDisabled(disabled => disabled.value = value);

    disabled = () => Boolean(this.configuration.disabled);

    disable = () => this.setDisabled(true);

    enable = () => this.setDisabled(false);

    availableValues = () => this.configuration.items.map(item => item.value)

    useSelected = (user: (subject: Property<T[]>) => any) => this.extract(configuration => configuration.selected)(user);

    selected = () => this.configuration.selected.value;

    select = (values: T[]) => {
        this.lock(() => this.useSelected(selected => selected.value = values))
        return this;
    };

    onSelect = (action: Dispatch<T[]>) => this.useSelected(selected => selected.consume(action))

    setAvailableValues = (values: T[]) => {
        this.configuration.setAvailableValues(values);
        return this;
    };

    draw = () => {
        const labelReference = useRef<HTMLLabelElement>(null);
        const offsetWidth = !this.properties.label ? 0 : labelReference.current?.offsetWidth || DEFAULT_SELECTOR_WIDTH;
        const style = useStyle(offsetWidth);
        const value = this.configuration.selectedIndexes.value?.map(index => this.configuration.items[index].suggestion);
        const options = this.configuration.items.map(item => item.suggestion);
        const baseProperties = {...this.properties};
        delete baseProperties.selected;
        delete baseProperties.available;
        delete baseProperties.itemFactory;
        return <Autocomplete
            {
                ...{
                    ...baseProperties,
                    disabled: this.configuration.disabled.value,
                    style: style.searcher,
                    value,
                    multiple: true,
                    options,
                    disableListWrap: true,
                    getOptionLabel: (label: string) => label,
                    onChange: fromSearcherEvent(this.configuration.selectItems),
                    renderOption: this.#renderOption,
                    renderTags: (options, getTagProps) => this.#renderTags(getTagProps, options as string[], style.chip),
                    renderInput: this.#renderInput,
                    noOptionsText: "Совпадений не найдено"
                }
            }/>
    };

    #renderOption = (option: string) => <Render key={option} factory={() => this.configuration.findItem(option)!.option.render()}/>;

    #renderTags = (getTagProperties: AutocompleteGetTagProps, options: string[], style: CSSProperties) => options.map((option, index) =>
        <Render key={option} factory={() => this.configuration.findItem(option)!.tag.render({...getTagProperties({index}), style})}/>
    );

    #renderInput = (params: AutocompleteRenderInputParams) =>
        <TextField {
                       ...{
                           ...params,
                           ...
                               (
                                   isString(this.properties.label)
                                       ?
                                       {
                                           label: this.properties.label
                                       }
                                       :
                                       {
                                           label:
                                               <Typography {...this.properties.label?.properties} variant={"inherit"}>
                                                   {this.properties.label?.text}
                                               </Typography>
                                       }
                               )
                       }
                   }
                   variant="outlined"
                   placeholder={this.properties.placeholder}/>;
}

export const searcher = <T extends any>(properties?: Properties<T>) => new ManagedSearcher<T>(properties, Configuration);

export const searcherItem = <T extends any>(properties: SearcherItemProperties<T>) => properties;

export type Searcher<T extends any> = ManagedSearcher<T>
