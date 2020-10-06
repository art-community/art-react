import React, {Dispatch, DispatchWithoutAction, Key} from "react";
import {random} from "../extensions/extensions";
import {hookContainer} from '../pattern/HookContainer';
import {Subscription} from "../pattern/Subscribe";
import {LifeCycle, LifeCycleAction} from "../pattern/Lifecycle";
import {ConfigurationToSubject, ConstructorType, SubjectUser} from "../types/Types";
import {synchronize, Synchronizer} from "../pattern/Synchronizer";
import {Render} from "../pattern/Render";
import {Configurable} from "../pattern/Configurable";
import {WidgetRender} from "../renderer/WidgetRenderer";
import {lazy} from "../pattern/Lazy";
import {lifecycleLogsEnabled} from "../constants/Constants";

export enum WidgetState {
    CREATED = "created",
    MOUNTED = "mounted",
    RENDERED = "rendered",
    DRAW = "draw",
    UNMOUNTED = "unmounted",
}

export abstract class Widget<ComponentType extends Widget<ComponentType>, PropertiesType = {}, ConfigurationType extends Configurable<unknown> = Configurable> {
    #emptyProperties = {} as PropertiesType;

    #emptyConfiguration = new Configurable(this as Widget<any>);

    #managed = lazy(() => this.configuration != this.#emptyConfiguration)

    #addons: Widget<any>[] = []

    #usedKey?: Key;

    #style?: any;

    readonly id = random();

    readonly key = () => this.#usedKey == undefined ? this.id as Key : this.#usedKey;

    protected synchronizer = synchronize();

    protected lifeCycle = new LifeCycle();

    protected subscriptions: Subscription[] = [];

    protected hooks = hookContainer();

    protected abstract draw: () => JSX.Element;

    protected properties: PropertiesType = this.#emptyProperties;

    protected get renderWithoutChanges() {
        return false
    };

    constructor(properties?: PropertiesType, configurationConstructor?: ConstructorType<ConfigurationType>) {
        if (lifecycleLogsEnabled()) {
            console.log(`[${this.widgetName}]: ${this.state}`);
        }
        this.lifeCycle.onCreate.forEach(action => action(this as Widget<ComponentType>));
        this.properties = properties || this.#emptyProperties;
        this.configuration = configurationConstructor ? new configurationConstructor(this, properties) : this.#emptyConfiguration;
    }

    configuration: ConfigurationType;

    widgetName: string = `${this.constructor.name}: ${this.key()}`;

    state = WidgetState.CREATED;

    onCreate = (action: LifeCycleAction<ComponentType>) => {
        this.lifeCycle.onCreate.push(action);
        return this as unknown as ComponentType;
    };

    onRender = (action: LifeCycleAction<ComponentType>) => {
        this.lifeCycle.onRender.push(action);
        return this as unknown as ComponentType;
    };

    onLoad = (action: LifeCycleAction<ComponentType>) => {
        this.lifeCycle.onLoad.push(action);
        return this as unknown as ComponentType;
    };

    onMount = (action: LifeCycleAction<ComponentType>) => {
        this.lifeCycle.onMount.push(action);
        return this as unknown as ComponentType;
    };

    onDraw = (action: LifeCycleAction<ComponentType>) => {
        this.lifeCycle.onDraw.push(action);
        return this as unknown as ComponentType;
    };

    onUnmount = (action: LifeCycleAction<ComponentType>) => {
        this.lifeCycle.onUnmount.push(action);
        return this as unknown as ComponentType;
    };

    subscribe = (subscription: Subscription) => {
        this.subscriptions.push(subscription);
        return this as unknown as ComponentType;
    };

    hookValue = this.hooks.hookValue;

    hookFunction = this.hooks.hookFunction;

    use = <Subject extends any>(subject: ConfigurationToSubject<ConfigurationType, Subject>, user: SubjectUser<Subject>) => {
        user(subject(this.configuration));
        return this as unknown as ComponentType;
    };

    with = (action: Dispatch<ComponentType>) => {
        action(this as unknown as ComponentType);
        return this as unknown as ComponentType;
    };

    extract = <Subject extends any>(subject: ConfigurationToSubject<ConfigurationType, Subject>) => (user: SubjectUser<Subject>) => this.use(subject, user);

    pause = () => {
        this.configuration.pauseRender();
        return this as unknown as ComponentType;
    };

    lock = (action: DispatchWithoutAction) => {
        this.pause();
        action();
        this.continue()
    };

    continue = () => {
        this.configuration.continueRender();
        return this as unknown as ComponentType;
    };

    synchronize = (lifeCycle: Dispatch<LifeCycleAction<ComponentType>>, action: (synchronizer: Synchronizer) => Synchronizer) => {
        lifeCycle(() => action(this.synchronizer.onStart(this.pause).onComplete(this.continue)).start());
        return this as unknown as ComponentType;
    };

    notify = () => {
        this.configuration.notifyTrigger();
        return this as unknown as ComponentType;
    }

    add = <T extends Widget<any>>(widget: T): T => {
        this.#addons.push(widget)
        return widget;
    }

    styled = (style: any) => {
        this.#style = style;
        return this;
    }

    useKey = (key: Key) => {
        this.#usedKey = key;
        return this;
    }

    render = (properties?: object) => {
        this.properties = {...this.properties, ...properties}
        const widgetRender = <WidgetRender configuration={this.configuration as Configurable}
                                           managed={this.#managed()}
                                           key={this.key()}
                                           widget={this as Widget<any>}
                                           hooks={this.hooks}
                                           subscriptions={this.subscriptions}
                                           renderWithoutChanges={this.renderWithoutChanges}
                                           addons={this.#addons}

                                           onLoad={() => {
                                               this.lifeCycle.onLoad.forEach(action => action(this as Widget<any>))
                                           }}

                                           onMount={() => {
                                               this.lifeCycle.onMount.forEach(action => action(this as Widget<any>));
                                               const lastState = this.state;
                                               this.state = WidgetState.MOUNTED;
                                               if (lifecycleLogsEnabled()) {
                                                   console.log(`[${this.widgetName}]: ${lastState} -> ${this.state}`);
                                               }
                                           }}

                                           onUnmount={() => {
                                               this.lifeCycle.onUnmount.forEach(action => action(this as Widget<any>));
                                               const lastState = this.state;
                                               this.state = WidgetState.UNMOUNTED;
                                               this.configuration.disposeTrigger();
                                               if (lifecycleLogsEnabled()) {
                                                   console.log(`[${this.widgetName}]: ${lastState} -> ${this.state}`);
                                               }
                                           }}

                                           onRender={() => {
                                               this.lifeCycle.onRender.forEach(action => action(this as Widget<any>));
                                               const lastState = this.state;
                                               this.state = WidgetState.RENDERED;
                                               if (lifecycleLogsEnabled()) {
                                                   console.log(`[${this.widgetName}]: ${lastState} -> ${this.state}`);
                                               }
                                           }}

                                           draw={() => {
                                               this.lifeCycle.onDraw.forEach(action => action(this as Widget<any>));
                                               const lastState = this.state;
                                               this.state = WidgetState.DRAW;
                                               if (lifecycleLogsEnabled()) {
                                                   console.log(`[${this.widgetName}]: ${lastState} -> ${this.state}`);
                                               }
                                               return <Render factory={() => this.draw()} key={this.key()}/>;
                                           }}
        />;
        return this.#style ? <div style={this.#style}>{widgetRender}</div> : widgetRender;
    }
}

export abstract class StaticWidget<ComponentType extends Widget<ComponentType>, PropertiesType = {}>
    extends Widget<ComponentType, PropertiesType, Configurable<PropertiesType>> {
    constructor(properties?: PropertiesType) {
        super(properties, Configurable);
    }
}

export abstract class ConfigurableWidget<ComponentType extends Widget<ComponentType>, ConfigurationType extends Configurable = Configurable>
    extends Widget<ComponentType, {}, ConfigurationType> {
    constructor(configurationConstructor?: ConstructorType<ConfigurationType>) {
        super({}, configurationConstructor || Configurable as ConstructorType<ConfigurationType>);
    }
}
