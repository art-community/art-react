import React, {DetailedHTMLProps, HTMLAttributes} from "react";
import {Widget} from "./Widget";
import {proxy} from "./Proxy";

export const form = (widget: Widget<any>, properties?: DetailedHTMLProps<HTMLAttributes<HTMLFormElement>, HTMLFormElement>) => proxy(
    <form {...properties}>
        {widget.render()}
    </form>
);
