import {BrowserRouter, Redirect, Route, RouteProps, Switch, useHistory} from "react-router-dom";
import * as React from "react";
import {Key} from "react";
import {Widget} from "../../widgets/Widget";
import {proxy} from "../../widgets/Proxy";

type WidgetFactory = () => Widget<any>;

type RouteWidgetProperties = {
    widgetFactory: WidgetFactory
    properties?: RouteProps & { key: Key }
}

export class SimpleRoutingSwitch extends Widget<SimpleRoutingSwitch> {
    #routes: RouteWidgetProperties[] = [];

    #history = this.hookValue(useHistory);

    addRoute = (path: string, widgetFactory: WidgetFactory) => {
        this.#routes.push({properties: {path: path, key: this.#routes.length}, widgetFactory});
        return this;
    };

    addNestedRouter = (widgetFactory: WidgetFactory) => {
        this.#routes.push({properties: {key: this.#routes.length}, widgetFactory});
        return this;
    };

    redirect = (path: string) => {
        this.#history().push(path)
        return this;
    }

    location = () => this.#history().location;

    draw = () =>
        <Switch>
            {this.#routes.map(route => <Route {...route.properties}>{route.widgetFactory().render()}</Route>)}
        </Switch>
}

export const browserRouter = (routingSwitch: Widget<any>) =>
    proxy(<BrowserRouter>{routingSwitch.render()}</BrowserRouter>);

export const route = (path: string, widget: Widget<any>, exact?: boolean) =>
    proxy(<Route path={path} exact={exact}>{widget.render()}</Route>);

export const redirect = (path: string) =>
    proxy(<Redirect to={path}/>)

export const routingSwitch = () => new SimpleRoutingSwitch();
