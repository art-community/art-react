import {PaperProps} from "@material-ui/core/Paper";
import {Paper} from "@material-ui/core";
import * as React from "react";
import Draggable from "react-draggable";
import {Widget} from "../../widgets/Widget";

type Properties = PaperProps

export class SimpleDraggablePaperComponent extends Widget<SimpleDraggablePaperComponent, Properties> {
    draw = () =>
        <Draggable allowAnyClick cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...this.properties} />
        </Draggable>
}

export const SimpleDraggablePaper = (properties?: PaperProps) =>
    <Draggable allowAnyClick cancel={'[class*="MuiDialogContent-root"]'}>
        <Paper {...properties}/>
    </Draggable>;

export const paper = (widget: Widget<any>, properties?: Omit<PaperProps, "children">) =>
    new SimpleDraggablePaperComponent({children: widget.render(), ...properties});
