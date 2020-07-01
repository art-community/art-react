import React from "react";
import {Divider, DividerProps, useTheme} from "@material-ui/core";
import {observe} from "../../pattern/Observable";
import {Widget} from "../../widgets/Widget";

type Properties = DividerProps

const useStyle = (marginTop?: number, marginBottom?: number) => {
    const theme = useTheme();
    return observe(theme, marginBottom, marginTop).render(() => ({
        marginTop: marginTop || theme.spacing(2),
        marginBottom: marginBottom || theme.spacing(2)
    }));
};

export class SimpleDivider extends Widget<SimpleDivider> {
    #marginTop: number = 0;
    #marginBottom: number = 0;

    constructor(marginTop?: number, marginBottom?: number, properties?: Properties) {
        super(properties);
        this.#marginTop = marginTop || 0;
        this.#marginBottom = marginBottom || 0;
    }

    draw = () => {
        const style = useStyle(this.#marginTop, this.#marginBottom);
        return observe(style).render(() =>
            <div style={style}>
                <Divider {...this.properties} variant={"fullWidth"}/>
            </div>
        );
    };
}

export const divider = (marginTop?: number, marginBottom?: number, properties?: Properties) => new SimpleDivider(marginTop, marginBottom, properties);
