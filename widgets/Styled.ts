import {Widget} from "./Widget";
import {div} from "./Div";

export const styled = (widget: Widget<any>, style: any) => div(widget, {style});
