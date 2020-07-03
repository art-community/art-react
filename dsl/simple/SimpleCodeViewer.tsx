import React, {Dispatch} from "react";
import {Variant} from "@material-ui/core/styles/createTypography";
import {Grid, Paper, Typography, useTheme} from "@material-ui/core";
import {observe} from "../../pattern/Observable";
import {codeEditor, CodeEditorProperties} from "../managed/ManagedCodeEditor";
import {Widget} from "../../widgets/Widget";
import {tooltip} from "./SimpleTooltip";
import {CODE_VIEWER_ELEVATION, DEFAULT_CODE_VIEWER_HEIGHT, DEFAULT_CODE_VIEWER_WIDTH} from "../../constants/Constants";

type Receiver = (setter: Dispatch<string>) => any;

type Properties = CodeEditorProperties & {
    fileNameLabelColor?: "primary" | "secondary"
    fileNameLabelVariant?: Variant
    receiver?: Receiver
};

const useStyle = () => {
    const theme = useTheme();
    return observe(theme).render(() => ({
        editor: {
            margin: theme.spacing(2)
        }
    }));
};

export class SimpleCodeViewer extends Widget<SimpleCodeViewer, Properties> {
    #editor = codeEditor({
        ...this.properties,
        width: this.properties?.width || DEFAULT_CODE_VIEWER_WIDTH,
        height: this.properties?.height || DEFAULT_CODE_VIEWER_HEIGHT,
        readOnly: true
    });

    draw = () => {
        const style = useStyle();
        return <Paper elevation={CODE_VIEWER_ELEVATION}>
            <div style={style.editor}>
                <Grid container direction={"column"} wrap={"nowrap"}>
                    <Grid item>
                        <Typography style={{textTransform: "none"}}
                                    color={this.properties?.fileNameLabelColor || "secondary"}
                                    variant={this.properties?.fileNameLabelVariant || "h6"}>
                            {this.properties?.label}
                        </Typography>
                    </Grid>
                    <Grid item>
                        {this.#editor.render()}
                    </Grid>
                </Grid>
            </div>
        </Paper>;
    };
}

export const codeViewer = (properties?: Properties) => new SimpleCodeViewer(properties);

export const codeTooltip = (widget: Widget<any>, properties?: Properties) => tooltip({interactive: true, placement: "right-end"})
.widget(widget)
.title(codeViewer(properties));

export const deferredCodeTooltip = (widget: Widget<any>, receiver: Receiver, properties?: Properties) => tooltip({interactive: true, placement: "right-end"})
.widget(widget)
.title(codeViewer({...properties, receiver}));
