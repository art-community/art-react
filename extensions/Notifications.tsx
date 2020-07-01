import {WithSnackbarProps} from "notistack";
import {Button, Grid, Typography} from "@material-ui/core";
import * as React from "react";
import {ReactNode} from "react";
import CloseOutlined from "@material-ui/icons/CloseOutlined";
import {doNothing, ERROR_SNAKE_MILLIS, INFO_SNAKE_MILLIS, SUCCESS_SNAKE_MILLIS, WARNING_SNAKE_MILLIS} from "../constants/Constants";

export class Notifications {
    private static INSTANCE: Notifications;
    #snackbarService?: WithSnackbarProps;
    #snackbars: Set<string> = new Set();

    constructor(snackbarService?: WithSnackbarProps) {
        if (Notifications.INSTANCE && this.#snackbarService) {
            throw new Error("Error - forObject Notifications.Notifications()");
        }
        this.#snackbarService = snackbarService || {
            enqueueSnackbar: message => {
                console.log(message);
                return Math.random();
            },
            closeSnackbar: doNothing
        };
    }

    createSingleLineSnack = (line: string) =>
        <Grid container>
            <Grid item>
                <Typography>
                    {line.toString()}
                </Typography>
            </Grid>
        </Grid>;

    createTwoLineSnack = (first: string, second: string) =>
        <Grid container direction={"column"}>
            <Grid item>
                <Typography>
                    {first}
                </Typography>
            </Grid>
            <Grid item>
                <Typography>
                    {second}
                </Typography>
            </Grid>
        </Grid>;

    createCloseAction = (key: any) => {
        this.#snackbars.add(key);
        return <Grid container>
            <Button onClick={() => this.#snackbarService?.closeSnackbar(key)}>
                <CloseOutlined htmlColor={"white"}/>
            </Button>
        </Grid>
    };

    remove = () => {
        const snackbarService = this.#snackbarService;
        if (snackbarService) {
            this.#snackbars.forEach(snackbarService.closeSnackbar);
        }
        this.#snackbars.clear()
    };

    customSuccess = (message: () => ReactNode) => {
        this.#snackbarService?.enqueueSnackbar(message(), {
            action: key => this.createCloseAction(key),
            variant: "success",
            autoHideDuration: SUCCESS_SNAKE_MILLIS
        });
    };

    customError = (message: () => ReactNode) => {
        this.#snackbarService?.enqueueSnackbar(message(), {
            action: key => this.createCloseAction(key),
            variant: "error",
            autoHideDuration: ERROR_SNAKE_MILLIS
        });
    };

    customInfo = (message: () => ReactNode) => {
        this.#snackbarService?.enqueueSnackbar(message(), {
            action: key => this.createCloseAction(key),
            variant: "info",
            autoHideDuration: INFO_SNAKE_MILLIS
        });
    };

    customWarning = (message: () => ReactNode) => {
        this.#snackbarService?.enqueueSnackbar(message(), {
            action: key => this.createCloseAction(key),
            variant: "warning",
            autoHideDuration: WARNING_SNAKE_MILLIS
        });
    };

    success = (message: string) => {
        this.#snackbarService?.enqueueSnackbar(this.createSingleLineSnack(message), {
            action: key => this.createCloseAction(key),
            variant: "success",
            autoHideDuration: SUCCESS_SNAKE_MILLIS
        });
    };

    info = (message: string) => {
        this.#snackbarService?.enqueueSnackbar(this.createSingleLineSnack(message), {
            action: key => this.createCloseAction(key),
            variant: "info",
            autoHideDuration: INFO_SNAKE_MILLIS
        })
    };

    warning = (message: string) => {
        this.#snackbarService?.enqueueSnackbar(this.createSingleLineSnack(message), {
            action: key => this.createCloseAction(key),
            variant: "warning",
            autoHideDuration: WARNING_SNAKE_MILLIS
        });
    };

    error = (message: string) => {
        this.#snackbarService?.enqueueSnackbar(this.createSingleLineSnack(message), {
            action: key => this.createCloseAction(key),
            variant: "error",
            autoHideDuration: ERROR_SNAKE_MILLIS
        });
    };

    static notifications = (snackbar?: WithSnackbarProps): Notifications => {
        if (!snackbar) {
            return new Notifications();
        }
        Notifications.INSTANCE = Notifications.INSTANCE || new Notifications(snackbar);
        return Notifications.INSTANCE;
    };
}
