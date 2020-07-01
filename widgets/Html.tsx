import React from "react";
import {Widget} from "./Widget";

type Properties = {
    html: string
    className?: string
}

class Html extends Widget<Html, Properties> {
    draw = () => {
        let {html, className} = this.properties;
        if (className == undefined) {
            className = ""
        }
        return <div className={className} dangerouslySetInnerHTML={{__html: html.replace(/\n/g, "<br />")}}/>;
    }
}

export const html = (properties?: Properties | string) => typeof properties == "string"
    ? new Html({html: properties})
    : new Html({...properties as Properties});
