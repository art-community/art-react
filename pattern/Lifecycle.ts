import {DispatchWithoutAction} from "react";
import {subscribe} from "./Subscribe";
import {Widget} from "../widgets/Widget";

export type LifeCycleAction<ComponentType extends Widget<ComponentType>> = (widget: ComponentType) => any;

export class LifeCycle<ComponentType extends Widget<ComponentType>> {
    onCreate: LifeCycleAction<ComponentType>[] = [];

    onLoad: LifeCycleAction<ComponentType>[] = [];

    onRender: LifeCycleAction<ComponentType>[] = [];

    onMount: LifeCycleAction<ComponentType>[] = [];

    onUnmount: LifeCycleAction<ComponentType>[] = [];

    onDraw: LifeCycleAction<ComponentType>[] = [];
}


export const onComponentMount = (action: DispatchWithoutAction) => subscribe(() => {
    action()
});

export const onComponentUnmount = (action: DispatchWithoutAction) => subscribe(() => action);
