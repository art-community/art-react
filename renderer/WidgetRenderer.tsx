import {Configurable} from "../pattern/Configurable";
import {HookContainer} from "../pattern/HookContainer";
import React, {DispatchWithoutAction, useCallback} from "react";
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

export const WidgetRenderer = <ConfigurationType extends Configurable<unknown>>(properties: RenderProperties<ConfigurationType>) => {
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
    const draw = properties.renderWithoutChanges ? properties.draw : useCallback(properties.draw, [trigger]);

    if (!properties.managed) {
        return <>{draw()}{properties.addons.map(addon => addon.render())}</>;
    }

    if (properties.renderWithoutChanges) {
        return <>{draw()}{properties.addons.map(addon => addon.render())}</>;
    }

    return observe(trigger).render(() => <>{draw()}{properties.addons.map(addon => addon.render())}</>);
};
