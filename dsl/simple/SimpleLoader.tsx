import {CircularProgress, Container, Grid, Typography} from "@material-ui/core";
import * as React from "react";
import {observe} from "../../pattern/Observable";
import {Widget} from "../../widgets/Widget";
import {hashOf} from "../../extensions/HashExtensions";
import {randomColor} from "../../constants/Constants";

const useStyle = (color?: string) => observe(color).render(() => ({
    container: {
        minHeight: "100vh"
    },
    progress: {
        color: color || randomColor(),
        animationDuration: "350ms"
    }
}));

type Properties = {
    label?: string
    color?: string
    size: "small" | "big"
}

export class SimpleLoader extends Widget<SimpleLoader, Properties> {
    draw = () => {
        const style = useStyle(this.properties?.color);
        const propertiesHash = hashOf(this.properties);
        return observe(propertiesHash, style).render(() => {
            if (this.properties?.size === "small") {
                const label = this.properties?.label &&
                    <Grid item>
                        <Typography variant={"h6"} color={"secondary"}>
                            {this.properties?.label}
                        </Typography>
                    </Grid>;
                return <Grid container spacing={1} alignItems={"center"}>
                    <Grid item>
                        <CircularProgress variant={"indeterminate"}
                                          style={style.progress}
                                          size={20}
                                          thickness={2.5}
                                          disableShrink
                                          color={"primary"}/>
                    </Grid>
                    <Grid item>
                        {label}
                    </Grid>
                </Grid>;
            }

            return <Container>
                <Grid justify="center"
                      alignContent={"center"}
                      alignItems={"center"}
                      style={style.container}
                      container>
                    <CircularProgress
                        variant={"indeterminate"}
                        disableShrink
                        style={style.progress}
                        size={"25%"}
                        thickness={0.5}/>
                </Grid>
            </Container>;
        });
    };
}

export const loaderBuilder = (properties?: Properties) => new SimpleLoader(properties);

export const smallLoader = (label?: string, color?: string) => loaderBuilder({label, color, size: "small"});

export const bigLoader = (color?: string) => loaderBuilder({size: "big", color});
