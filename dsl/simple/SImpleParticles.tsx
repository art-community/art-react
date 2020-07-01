import React from "react";
import {Widget} from "../../widgets/Widget";
import {Particles} from "@blackbox-vision/react-particles";
import {empty} from "./SimpleEmptyComponent";
import {useTheme} from "@material-ui/core";

type Parameters = (color: string) => any;
type ParticlesProps = { parameters: Parameters; }

export class SimpleParticles extends Widget<SimpleParticles, ParticlesProps> {
    #widget: Widget<any>;

    constructor(properties: ParticlesProps, widget: Widget<any>) {
        super(properties);
        this.#widget= widget;
    }

    draw = () => {
        const theme = useTheme();
        return <>
            <Particles
                width="100%"
                height="100%"
                style={{position: "absolute"}}
                params={{...this.properties.parameters(theme.palette.primary.main)}}
            />
            <div style={{position: "relative"}}>
                {this.#widget.render()}
            </div>
        </>;
    }
}

export const particles = (parameters: Parameters, widget?: Widget<any>, properties?: ParticlesProps) =>
    new SimpleParticles({parameters, ...properties}, widget || empty());
