import React, {ChangeEvent, DispatchWithoutAction, KeyboardEvent} from "react";
import * as monacoEditor from "monaco-editor";
import {asynchronous} from "../extensions/extensions";

export const UTF_8 = "utf-8"

export enum CodeEditorTheme {
    DARK = 'dark',
    LIGHT = 'light'
}

export const BLANK = '_blank';
export const SELF = '_self';
export const SPACE = ' ';

export const DEFAULT_SELECTOR_WIDTH = 200;
export const DEFAULT_DIALOG_TRANSITION_TIMEOUT = 0;
export const DEFAULT_TOOLTIP_TRANSITION_TIMEOUT = 0;
export const DEFAULT_PANEL_TRANSITION_TIMEOUT = 0;
export const DEFAULT_DIALOG_BACKDROP_COLOR = "rgba(0,0,0,0.30)";
export const DEFAULT_CODE_EDITOR_HEIGHT = 500;
export const DEFAULT_CODE_EDITOR_WIDTH = 500;
export const DEFAULT_CODE_VIEWER_HEIGHT = 300;
export const DEFAULT_CODE_VIEWER_WIDTH = 500;

export const CODE_VIEWER_ELEVATION = 2;

export const SUCCESS_SNAKE_MILLIS = 10000;
export const INFO_SNAKE_MILLIS = 5000;
export const WARNING_SNAKE_MILLIS = 10000;
export const ERROR_SNAKE_MILLIS = 60 * 60 * 1000;

export const ENTER_DEBOUNCE_TIMEOUT = 10;

export const doNothing = () => {
};

export const ignore = (_?: unknown) => () => doNothing;

export const identity = <T>(value: T) => value;

export const randomColor = () => `#${((1 << 24) * Math.random() | 0).toString(16)}`;

export const lifecycleLogsEnabled = () => false;

export const fromMouseEvent = (action: ((input: unknown) => unknown) | undefined) =>
    action
        ? (event: React.MouseEvent<HTMLElement>) => {
            action?.(event.currentTarget);
        }
        : undefined;

export const fromTextChangeEvent = (action: ((input: unknown) => unknown) | undefined) =>
    action
        ? (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            action?.(event.target.value);
        }
        : undefined;

export const fromTabChangeEvent = (action: ((input: unknown) => unknown) | undefined) =>
    action
        ? (event: React.ChangeEvent<{}>, value: any) => {
            action?.(value);
        }
        : undefined;

export const fromCheckEvent = (action: ((checked: boolean) => unknown) | undefined) =>
    action
        ? (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
            action?.(checked);
        }
        : undefined;

export const fromSelectEvent = (action: ((value: unknown) => unknown) | undefined) =>
    action
        ? (event: ChangeEvent<{ name?: string; value: unknown }>) => {
            action?.(event.target.value);
        }
        : undefined;

export const fromSearcherEvent = (action: ((value: unknown) => unknown) | undefined) =>
    action
        ? (event: ChangeEvent<{}>, value: unknown | null) => {
            action?.(value);
        }
        : undefined;

export const fromEditorEvent = (action: ((value: unknown) => unknown) | undefined) =>
    action
        ? (event: monacoEditor.editor.IModelContentChangedEvent, value: string | undefined) => {
            action?.(value);
        }
        : undefined;


export const fromSliderEvent = (action: ((value: unknown) => unknown) | undefined) =>
    action
        ? (event: React.ChangeEvent<{}>, value: number | number[]) => {
            action?.(value);
        }
        : undefined;


export const handleEnter = (action: DispatchWithoutAction) => (event: KeyboardEvent<unknown>) => {
    if (event.key == "Enter") {
        asynchronous(action, ENTER_DEBOUNCE_TIMEOUT);
    }
}
