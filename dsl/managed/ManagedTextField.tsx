import React, {Dispatch, DispatchWithoutAction, useState} from "react";
import {createStyles, IconButton, TextField, TextFieldProps, Tooltip} from "@material-ui/core";
import {Configurable} from "../../pattern/Configurable";
import {label} from "./ManagedLabel";
import {observe} from "../../pattern/Observable";
import VisibilityOffOutlined from "@material-ui/icons/VisibilityOffOutlined";
import VisibilityOutlined from "@material-ui/icons/VisibilityOutlined";
import {makeStyles} from "@material-ui/styles";
import {event} from "../../pattern/Event";
import {Widget} from "../../widgets/Widget";
import {DEFAULT_TOOLTIP_TRANSITION_TIMEOUT, fromTextChangeEvent, handleEnter} from "../../constants/Constants";

type Properties = TextFieldProps & {
    password?: boolean
    mask?: RegExp
    regexp?: RegExp
    defaultErrorText?: string
}

type ErrorProperties = {
    error: boolean
    text?: string
}

const useTooltipStyle = makeStyles(() => createStyles({
        noMaxWidth: {
            maxWidth: "none"
        }
    }
));

class Configuration extends Configurable<Properties> {
    disabled = this.property(Boolean(this.defaultProperties.disabled));

    error = this.property<ErrorProperties>({
        error: Boolean(this.defaultProperties.error),
        text: this.defaultProperties.defaultErrorText
    });

    regexp = this.property<RegExp>(this.defaultProperties.regexp);

    mask = this.property<RegExp>(this.defaultProperties.mask);

    password = this.property<boolean>(this.defaultProperties.password);

    text = this.property<string>(this.defaultProperties.value == undefined ? "" : this.defaultProperties.value as string)
    .prevent((value: string) => {
        const mask = this.mask.value;
        if (value && mask && !value.match(mask)) {
            return false;
        }
        const regexp = this.regexp.value;
        this.error.value = {
            error: Boolean(value && regexp && !value.match(regexp)),
            text: this.defaultProperties.defaultErrorText
        };
        return true;
    });

    enter = event();
}

export class ManagedTextField extends Widget<ManagedTextField, Properties, Configuration> {
    #mapper = text => text;

    #errorLabel = label({text: this.configuration.error.value?.text || ""})
    .useText(text => this.configuration.error.consume(value => value?.text && text.set(value.text)));

    useDisabled = this.extract(configuration => configuration.disabled);

    setDisabled = (value: boolean) => this.useDisabled(disabled => disabled.value = value);

    disabled = () => Boolean(this.configuration.disabled.value);

    disable = () => this.setDisabled(true);

    enable = () => this.setDisabled(false);


    usePassword = this.extract(configuration => configuration.password);

    setPassword = (value: boolean) => this.usePassword(password => password.value = value);

    isPassword = () => Boolean(this.configuration.password.value);


    useMask = this.extract(configuration => configuration.mask);

    setMask = (value: RegExp) => this.useMask(mask => mask.value = value);

    mask = () => this.configuration.mask;


    useRegExp = this.extract(configuration => configuration.regexp);

    setRegExp = (value: RegExp) => this.useRegExp(regexp => regexp.value = value);

    regExp = () => this.configuration.regexp;


    useError = this.extract(configuration => configuration.error);

    setError = (value: ErrorProperties) => this.useError(error => error.value = value);

    onErrorChanged = (action: Dispatch<boolean>) => this.useError(error => error
    .consume(value => action(Boolean(value?.error))));

    error = () => Boolean(this.configuration.error.value?.error);


    useText = this.extract(configuration => configuration.text);

    onTextChanged = (action: Dispatch<string>) => this.useText(text => text.consume(action));

    onEnterPressed = (action: DispatchWithoutAction) => {
        this.configuration.enter.handle(action);
        return this;
    };

    setText = (value: string) => this.useText(text => text.value = value);

    clear = () => this.setText("");

    text = () => this.configuration.text.value;

    value = () => this.#mapper(this.configuration.text.value);

    required = () => Boolean(this.properties.required);

    valueMapper = (mapper: (value: string) => any) => {
        this.#mapper = mapper;
        return this;
    }

    draw = () => {
        const tooltipStyle = useTooltipStyle();
        const [passwordVisible, setPasswordVisibility] = useState(false);
        const [tooltipVisible, setTooltipVisibility] = useState(false);

        const passwordIcon = observe(passwordVisible).render(() => passwordVisible
            ? <VisibilityOutlined color={"primary"}/>
            : <VisibilityOffOutlined color={"primary"}/>);

        const inputProperties = observe(passwordVisible, this.configuration.password.value, this.properties?.InputProps)
        .render(() => !this.isPassword()
            ? this.properties?.InputProps
            : {
                ...this.properties?.InputProps,
                endAdornment:
                    <IconButton
                        onClick={() => setPasswordVisibility(!passwordVisible)}>{passwordIcon}
                    </IconButton>
            });

        const baseProperties = {...this.properties};
        delete baseProperties.password;
        delete baseProperties.defaultErrorText;
        delete baseProperties.regexp;
        delete baseProperties.mask;
        delete baseProperties.color;

        const field =
            <TextField
                {...
                    {
                        ...baseProperties,
                        InputProps: inputProperties,
                        color: this.configuration.error.value?.error ? undefined : this.properties.color,
                        type: this.isPassword() && !passwordVisible ? "password" : "text",
                        variant: "outlined",
                        disabled: this.configuration.disabled.value,
                        error: this.configuration.error.value?.error,
                        value: this.configuration.text.value || "",
                        onChange: fromTextChangeEvent(this.configuration.text.set),
                        onKeyDown: handleEnter(this.configuration.enter.execute)
                    }
                }/>;

        const error = this.configuration.error.value?.error && Boolean(this.configuration.error.value?.text);

        return <Tooltip open={error && tooltipVisible}
                        classes={{tooltip: tooltipStyle.noMaxWidth}}
                        TransitionProps={{timeout: DEFAULT_TOOLTIP_TRANSITION_TIMEOUT}}
                        title={this.#errorLabel.render()}>
            <div onTouchStart={() => setTooltipVisibility(error)}
                 onTouchEnd={() => setTooltipVisibility(false)}
                 onMouseEnter={() => setTooltipVisibility(error)}
                 onMouseLeave={() => setTooltipVisibility(false)}>
                {field}
            </div>
        </Tooltip>
    };
}

export const text = (properties?: Properties | string) => typeof properties == "string"
    ? new ManagedTextField({value: properties}, Configuration)
    : new ManagedTextField(properties, Configuration);
