import {Avatar, AvatarProps, Typography} from "@material-ui/core";
import React from "react";
import {Widget} from "../../widgets/Widget";
import {isString, isWidget} from "../../extensions/Determiners";

type Properties = AvatarProps

export class SimpleAvatar extends Widget<SimpleAvatar, Properties> {
    draw = () => <Avatar {...this.properties}/>;
}

export const avatar = (widget: Widget<any> | JSX.Element | string, properties?: Properties) => {
    const children = isString(widget)
        ? <Typography>{widget}</Typography>
        : isWidget(widget)
            ? widget.render()
            : widget;
    return new SimpleAvatar({children, ...properties});
};
