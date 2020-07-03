import React, {Dispatch, DispatchWithoutAction} from "react";
import {Grid, GridDirection, IconButton, Paper, Tooltip, Typography, useTheme} from "@material-ui/core";
import AddOutlined from "@material-ui/icons/AddOutlined";
import {Widget} from "../../widgets/Widget";
import {Configurable} from "../../pattern/Configurable";
import {isEmptyArray, isNotEmptyArray} from "../../extensions/extensions";
import {divider} from "../simple/SimpleDivider";
import {observe} from "../../pattern/Observable";
import DeleteOutlined from "@material-ui/icons/DeleteOutlined";
import equal from "fast-deep-equal";
import {immutable} from "../../pattern/Immutable";
import {conditional} from "../../pattern/Conditional";
import {Render} from "../../pattern/Render";
import {Breakpoint} from "@material-ui/core/styles/createBreakpoints";
import {GridSize} from "@material-ui/core/Grid/Grid";
import {defer} from "../../pattern/Deferred";
import {event} from "../../pattern/Event";
import {DEFAULT_TOOLTIP_TRANSITION_TIMEOUT} from "../../constants/Constants";

type EditingDisabledProperties = {
    exclusion: number
}

type CollectionItemProperties<T extends Widget<any>> = {
    widget: T,
    validator: () => boolean
    valueConsumer: (dispatch: Dispatch<any>) => any
    valueExtractor: () => any
    disableHandler?: (disabled: boolean) => any
    duplicateHandler?: (duplicate: boolean) => any
}

type CollectionItem<T extends Widget<any>> = CollectionItemProperties<T> & {
    id: number
}

type Properties<T extends Widget<any>> = {
    label?: string
    labelDivider?: boolean
    factory: ComponentFactoryType<T>
    ids?: number[]
    direction?: GridDirection
    addButtonTooltip?: string
    deleteButtonTooltip?: string
}

type ReducedFactoryType<T extends Widget<any>> = (id: number) => CollectionItemProperties<T>;

type ComponentFactoryType<T extends Widget<any>> = (id: number, component: ManagedCollection<T>) => CollectionItemProperties<T>;

function* itemSequence(initial: number[]) {
    let id = (initial.find(id => initial.every(lessThan => id >= lessThan)) || 0) + 1;
    while (true) yield id++;
}

const useStyle = () => {
    const theme = useTheme();
    return observe(theme).render(() => ({
        paper: {
            padding: theme.spacing(2)
        }
    }))
};

class Configuration<T extends Widget<any>> extends Configurable<Properties<T>> {
    #sequence: Generator<number, void> = itemSequence(this.defaultProperties?.ids || []);

    last?: CollectionItem<T>;

    items = this.property<CollectionItem<T>[]>([]);

    additionDisabled = this.property(false);

    deletionDisabled = this.property(false);

    editingDisabled = this.property<EditingDisabledProperties>();

    add = event<CollectionItem<T>>()

    delete = event<CollectionItem<T>>()

    clear = () => {
        this.items.value = []
        this.additionDisabled.value = false;
        this.editingDisabled.clear();
        this.items.value = [];
        this.last = undefined;
        return this;
    }

    addNewItem = (factory: ReducedFactoryType<T>) => {
        this.addItem(this.#sequence.next().value as number, factory);
        return this;
    };

    addItem = (id: number, factory: ReducedFactoryType<T>) => {
        const widget = factory(id);
        const newItem = {id, ...widget};
        this.items.value.push(newItem);
        this.last = newItem;
        this.validateItemsExcept(newItem);
        this.editingDisabled
        .cleared(() => widget.disableHandler?.(false))
        .consume(disabled => widget.disableHandler?.(disabled?.exclusion != id));
        widget.valueConsumer(() => this.validateItemsExcept(newItem))
        this.add.execute(newItem)
        return this;
    };

    deleteItem = (id: number) => {
        this.additionDisabled.value = false;
        if (this.editingDisabled.value && this.editingDisabled.value!.exclusion == id) {
            this.editingDisabled.clear();
        }
        const item = this.items.value.find(item => item.id == id)
        if (item != undefined) {
            this.items.value = this.items.value.filter(item => item.id != id);
            this.last = this.items.value!.last();
            this.delete.execute(item)
        }
        return this;
    };

    validateItemsExcept = (except: CollectionItem<T>) => {
        if (this.additionDisabled.value) {
            this.additionDisabled.value = false;
        }
        if (this.editingDisabled.value) {
            this.editingDisabled.clear();
        }

        for (const item of this.items.value) {
            if (item.validator()) {
                this.pauseRender();
                this.additionDisabled.value = true;
                this.editingDisabled.value = {exclusion: except.id};
                this.continueRender();
                return this;
            }
            if (item.id != except.id && equal(except.valueExtractor(), item.valueExtractor())) {
                except.duplicateHandler?.(true);
                this.pauseRender();
                this.additionDisabled.value = true;
                this.editingDisabled.value = {exclusion: except.id};
                this.continueRender();
                return this;
            }
        }
        except.duplicateHandler?.(false);
    }
}

export class ManagedCollection<T extends Widget<any>> extends Widget<ManagedCollection<T>, Properties<T>, Configuration<T>> {
    constructor(properties?: Properties<T>) {
        super(properties, Configuration);
        this.properties.ids?.forEach(id => this.configuration.addItem(id, itemId => this.properties.factory(itemId, this)))
    }

    clear = () => {
        this.configuration.clear();
        return this;
    }

    items = () => this.configuration.items.value || [];

    item = (id: number) => this.items().find(item => item.id == id)!

    widget = (id: number) => this.items().find(item => item.id == id)!.widget

    values = () => this.configuration.items.value?.map(item => item.valueExtractor?.())?.filter(value => value != undefined);

    widgets = (): T[] => this.items().map(item => item.widget as T)

    useAdditionDisabled = this.extract(configuration => configuration.additionDisabled);

    additionDisabled = () => Boolean(this.configuration.additionDisabled.value);

    onAdditionDisabled = (action: DispatchWithoutAction) => this.useAdditionDisabled(disabled => disabled.consume(disabled => {
        if (disabled) {
            action();
        }
    }));

    onAdditionEnabled = (action: DispatchWithoutAction) => this.useAdditionDisabled(disabled => disabled.consume(disabled => {
        if (!disabled) {
            action();
        }
    }));

    setAdditionDisabled = (value: boolean) => {
        this.useAdditionDisabled(property => property.value = value);
        return this
    };

    enableAddition = () => this.setAdditionDisabled(false);

    disableAddition = () => this.setAdditionDisabled(true);


    useDeletionDisabled = this.extract(configuration => configuration.deletionDisabled);

    deletionDisabled = () => Boolean(this.configuration.deletionDisabled.value);

    onDeletionDisabled = (action: DispatchWithoutAction) => this.useDeletionDisabled(disabled => disabled.consume(disabled => {
        if (disabled) {
            action();
        }
    }));

    onDeletionEnabled = (action: DispatchWithoutAction) => this.useDeletionDisabled(disabled => disabled.consume(disabled => {
        if (!disabled) {
            action();
        }
    }));

    setDeletionDisabled = (value: boolean) => {
        this.useDeletionDisabled(property => property.value = value);
        return this
    };

    enableDeletion = () => this.setDeletionDisabled(false);

    disableDeletion = () => this.setDeletionDisabled(true);


    useEditingDisabled = this.extract(configuration => configuration.editingDisabled);

    onEditingDisabled = (action: Dispatch<number>) => this.useEditingDisabled(disabled => disabled.consume(disabled => {
        if (disabled?.exclusion != undefined) {
            action(disabled!.exclusion);
        }
    }));

    onEditingEnabled = (action: DispatchWithoutAction) => this.useEditingDisabled(disabled => disabled.cleared(action));

    editingDisabled = () => Boolean(this.configuration.editingDisabled.value);

    disableEditingExcept = (exclusion: number) => {
        this.useEditingDisabled(property => property.value = {exclusion: exclusion});
        return this;
    };


    disableExcept = (exclusion: number) => {
        this.disableAddition();
        this.disableEditingExcept(exclusion);
        return this;
    };

    enableEditing = () => {
        this.useEditingDisabled(property => property.clear());
        return this;
    };

    enable = () => {
        this.enableAddition();
        this.enableEditing();
        return this;
    };

    #renderItem = (item: CollectionItem<T>, style: ReturnType<typeof useStyle>) => {
        const editingDisabled = this.configuration.editingDisabled.value && item.id != this.configuration.editingDisabled.value!.exclusion;
        const deletionDisabled = this.configuration.deletionDisabled.value;
        const additionDisabled = this.configuration.additionDisabled.value;

        const deleteIcon = observe(editingDisabled).render(() =>
            this.properties.deleteButtonTooltip
                ? <Grid item>
                    <Tooltip title={<Typography>{this.properties.addButtonTooltip}</Typography>}
                             placement={"bottom"}
                             TransitionProps={{timeout: DEFAULT_TOOLTIP_TRANSITION_TIMEOUT}}>
                        <span>
                            <IconButton disabled={editingDisabled || deletionDisabled} onClick={() => this.configuration.deleteItem(item.id)}>
                                <DeleteOutlined color={editingDisabled || deletionDisabled ? "disabled" : "primary"}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
                : <Grid item>
                    <IconButton disabled={editingDisabled || deletionDisabled} onClick={() => this.configuration.deleteItem(item.id)}>
                        <DeleteOutlined color={editingDisabled || deletionDisabled ? "disabled" : "primary"}/>
                    </IconButton>
                </Grid>
        );

        const addIcon = defer(item.id, additionDisabled, this.configuration.last?.id).render(() =>
            this.properties.addButtonTooltip
                ? <Grid item>
                    <Tooltip title={<Typography>{this.properties.addButtonTooltip}</Typography>}
                             placement={"bottom"}
                             TransitionProps={{timeout: DEFAULT_TOOLTIP_TRANSITION_TIMEOUT}}>
                        <span>
                            <IconButton disabled={additionDisabled}
                                        onClick={() => this.configuration.addNewItem(id => this.properties.factory(id, this))}>
                                <AddOutlined color={additionDisabled ? "disabled" : "primary"}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
                : <Grid item>
                    <IconButton disabled={additionDisabled}
                                onClick={() => this.configuration.addNewItem(id => this.properties.factory(id, this))}>
                        <AddOutlined color={additionDisabled ? "disabled" : "primary"}/>
                    </IconButton>
                </Grid>
        );

        const widget = immutable(<Grid item xs>{item.widget.render()}</Grid>);

        const itemComponent = observe(editingDisabled, style).render(() =>
            <Grid item xs>
                <Paper style={style.paper}>
                    <Grid container alignItems={"flex-end"} wrap={"nowrap"}>
                        {widget}
                        {deleteIcon}
                    </Grid>
                </Paper>
            </Grid>
        );

        const breakpoints = this.properties.direction
            ? {xs: true}
            : {xs: 4, sm: 4, md: 4, lg: 4, xl: 4} as Record<Breakpoint, boolean | GridSize>;

        return <Grid {...breakpoints} item>
            <Grid container alignItems={"center"} direction={this.properties.direction} wrap={"nowrap"}>
                <Grid item container alignItems={"flex-start"} wrap={"nowrap"}>
                    {itemComponent}
                </Grid>
                {item.id == this.configuration.last?.id && addIcon}
            </Grid>
        </Grid>;
    };


    onAdd = (action: Dispatch<CollectionItem<T>>) => {
        this.configuration.add.handle(action);
        return this;
    }

    onDelete = (action: Dispatch<CollectionItem<T>>) => {
        this.configuration.delete.handle(action);
        return this;
    }


    #divider = conditional(() => this.properties.labelDivider).persist(() => divider(1, 1));

    draw = () => {
        const style = useStyle();

        const addIcon = defer(this.configuration.additionDisabled.value).render(() =>
            this.properties.addButtonTooltip
                ? <Grid item>
                    <Tooltip title={<Typography>{this.properties.addButtonTooltip}</Typography>}
                             placement={"bottom"}
                             TransitionProps={{timeout: DEFAULT_TOOLTIP_TRANSITION_TIMEOUT}}>
                        <IconButton disabled={this.configuration.additionDisabled.value}
                                    onClick={() => this.configuration.addNewItem(id => this.properties.factory(id, this))}>
                            <AddOutlined color={this.configuration.additionDisabled.value ? "disabled" : "primary"}/>
                        </IconButton>
                    </Tooltip>
                </Grid>
                : <Grid item>
                    <IconButton disabled={this.configuration.additionDisabled.value}
                                onClick={() => this.configuration.addNewItem(id => this.properties.factory(id, this))}>
                        <AddOutlined color={this.configuration.additionDisabled.value ? "disabled" : "primary"}/>
                    </IconButton>
                </Grid>
        );

        const items = isNotEmptyArray(this.configuration.items.value) &&
            <Grid item container spacing={1} direction={this.properties.direction}>
                {this.configuration
                    .items
                    .value!.map(item => <Render key={item.id} factory={() => this.#renderItem(item as CollectionItem<T>, style)}/>)}
            </Grid>;

        return <Grid container spacing={1} direction={"column"}>
            {this.properties.label &&
            <Grid item>
                <Typography variant={"h6"} color={"secondary"} noWrap>{this.properties.label}</Typography>
            </Grid>}
            <Grid item>
                {this.#divider.render()}
            </Grid>
            <Grid item container alignItems={"center"} direction={this.properties.direction} wrap={"nowrap"}>
                {items}
                {isEmptyArray(this.configuration.items.value) && addIcon}
            </Grid>
        </Grid>
    };
}

export const collection = <T extends Widget<any>>(properties: Properties<T>) => new ManagedCollection<T>(properties);

export const collectionItem = <T extends Widget<any>>(properties: CollectionItemProperties<T>) => properties;
