import {Configurable} from "../pattern/Configurable";
import {HookContainer} from "../pattern/HookContainer";
import React, {DispatchWithoutAction} from "react";
import {subscribe, Subscription} from "../pattern/Subscribe";
import {onComponentMount, onComponentUnmount} from "../pattern/Lifecycle";
import {useTriggerState} from "../hooks/Hooks";
import {observe} from "../pattern/Observable";
import {Widget, WidgetState} from "../widgets/Widget";

type RenderProperties<ConfigurationType extends Configurable<unknown>> = {
    configuration: ConfigurationType
    draw: () => JSX.Element
    addons: Widget<any>[]
    widget: Widget<any>
    hooks: HookContainer
    onMount: DispatchWithoutAction
    onUnmount: DispatchWithoutAction
    onRender: DispatchWithoutAction
    onLoad: DispatchWithoutAction
    subscriptions: Subscription[]
    renderWithoutChanges: boolean
    managed: boolean
};

export const WidgetRender = <ConfigurationType extends Configurable<unknown>>(properties: RenderProperties<ConfigurationType>) => {
    properties.hooks.evaluate();

    if (properties.widget.state == WidgetState.CREATED) {
        properties.onLoad();
    }

    properties.onRender()
    onComponentMount(properties.onMount);
    onComponentUnmount(properties.onUnmount)

    subscribe(() => {
        const disposers = properties.subscriptions.map(subscription => subscription());
        return () => disposers.forEach(dispose => dispose());
    });

    const trigger = useTriggerState(properties.configuration);

    if (!properties.managed) {
        return <>{properties.draw()}{properties.addons.map(addon => addon.render())}</>;
    }

    return properties.renderWithoutChanges
        ? <>{properties.draw()}{properties.addons.map(addon => addon.render())}</>
        : observe(trigger).render(() => <>{properties.draw()}{properties.addons.map(addon => addon.render())}</>);
};
