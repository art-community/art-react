import React, {DetailedHTMLProps, HTMLAttributes} from "react";
import {Widget} from "./Widget";
import {proxy} from "./Proxy";

export const div = (widget: Widget<any>, properties?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => proxy(
    <div {...properties}>
        {widget.render()}
    </div>
);
