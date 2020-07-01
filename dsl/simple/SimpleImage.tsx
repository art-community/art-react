import React, {CSSProperties} from "react";
import {Widget} from "../../widgets/Widget";

type Properties = {
    alt?: string
    style?: CSSProperties
    src: string
    width?: string | number
    height?: string | number
}

export class SimpleImage extends Widget<SimpleImage, Properties> {
    draw = () => <img  {...this.properties} alt={this.properties?.alt || ""}/>;
}

export const image = (properties: Properties) => new SimpleImage(properties);
