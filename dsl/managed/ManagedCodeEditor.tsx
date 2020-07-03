import React, {Dispatch} from "react";
import {Configurable} from "../../pattern/Configurable";
import {ControlledEditor, ControlledEditorProps} from "@monaco-editor/react";
import {calculateCodeSyntax} from "../../../constants/CodeSynstaxCalculator";
import {smallLoader} from "../simple/SimpleLoader";
import {Widget} from "../../widgets/Widget";
import {CodeEditorTheme, DEFAULT_CODE_EDITOR_HEIGHT, fromEditorEvent} from "../../constants/Constants";
import {asynchronous} from "../../extensions/extensions";
import {styled} from "../../widgets/Styled";
import {verticalGrid} from "./ManagedGrid";
import {label} from "./ManagedLabel";
import {panel} from "./ManagedPanel";
import {lazy} from "../../pattern/Lazy";

type Receiver = (setter: Dispatch<string>) => any;

export type CodeEditorProperties = ControlledEditorProps & {
    themeName?: CodeEditorTheme
    label?: string
    language?: string
    fileName?: string
    panel?: boolean
    height?: number | string
    width?: number | string
    readOnly?: boolean
    receiver?: Receiver
}

class Configuration extends Configurable<CodeEditorProperties> {
    fileName = this.property(this.defaultProperties.fileName)

    language = this.property(this.defaultProperties.language)

    text = this.property(this.defaultProperties.value || "");

    themeName = this.property(this.defaultProperties.themeName);

    readOnly = this.property(this.defaultProperties.readOnly)
}

export class ManagedCodeEditor extends Widget<ManagedCodeEditor, CodeEditorProperties, Configuration> {
    #loader = styled(smallLoader(), {
        width: this.properties.width,
        height: this.properties.height || DEFAULT_CODE_EDITOR_HEIGHT,
    });

    #loaded = !this.properties.receiver;

    setThemeName = (name: CodeEditorTheme) => {
        this.configuration.themeName.value = name;
        return this;
    }

    useText = this.extract(configuration => configuration.text);

    setText = (value: string) => {
        this.useText(text => text.value = value);
        return this;
    }

    text = () => this.configuration.text.value;


    onTextChanged = (action: Dispatch<string>) => {
        this.useText(text => text.consume(action));
        return this;
    }

    useFileName = this.extract(configuration => configuration.fileName);

    setFileName = (value: string) => {
        this.useFileName(name => name.value = value);
        return this;
    }

    fileName = () => this.configuration.fileName.value;


    onReadOnlyChanged = (action: Dispatch<boolean>) => {
        this.useReadOnly(readOnly => readOnly.consume(action));
        return this;
    }

    useReadOnly = this.extract(configuration => configuration.readOnly);

    setReadOnly = (value: boolean) => {
        this.useReadOnly(readOnly => readOnly.value = value);
        return this;
    }

    readOnly = () => this.configuration.readOnly.value;


    onFileNameChanged = (action: Dispatch<string>) => {
        this.useFileName(text => text.consume(action));
        return this;
    }

    useLanguage = this.extract(configuration => configuration.language);

    setLanguage = (value: string) => {
        this.useLanguage(text => text.value = value);
        return this;
    }

    language = () => this.configuration.language.value;

    onLanguageChanged = (action: Dispatch<string>) => {
        this.useLanguage(text => text.consume(action));
        return this;
    }

    clearText = () => this.setText("");

    draw = () => {
        const baseProperties = {...this.properties};
        delete baseProperties.label;
        delete baseProperties.language;
        delete baseProperties.fileName;
        delete baseProperties.panel;
        delete baseProperties.height;
        delete baseProperties.width;
        delete baseProperties.readOnly;

        if (!this.#loaded) {
            asynchronous(() => this.properties.receiver!(value => {
                this.#loaded = true
                this.configuration.text.value = value
            }))
        }

        return !this.#loaded ? this.#loader.render()
            : <ControlledEditor
                {...
                    {

                        ...baseProperties,
                        options: {...this.properties.options, readOnly: Boolean(this.configuration.readOnly.value)},
                        value: this.configuration.text.value,
                        theme: this.configuration.themeName.value == CodeEditorTheme.DARK ? "dark" : "light",
                        language: this.properties.language
                            ? calculateCodeSyntax(this.configuration.language.value)
                            : calculateCodeSyntax(this.configuration.fileName.value?.toLowerCase()?.split(".")[1]),
                        loading: this.#loader.render(),
                        width: this.properties.width,
                        height: this.properties.height || DEFAULT_CODE_EDITOR_HEIGHT,
                        onChange: fromEditorEvent(value => {
                            if (this.properties.readOnly) {
                                return
                            }
                            return this.configuration.text.value = value as string;
                        })
                    }
                }
            />;
    };
}

const labeled = (editor: ManagedCodeEditor, text: string) => verticalGrid({spacing: 1})
.pushWidget(label({
    text: text,
    color: "secondary",
    variant: "h6"
}))
.pushWidget(editor);

class ManagedCodeEditorWrapper extends ManagedCodeEditor {
    #editor = lazy(() => {
        const editor = new ManagedCodeEditor(this.properties, Configuration);
        editor.configuration = this.configuration;
        return editor;
    })

    #widget = lazy(() => {
        if (this.properties.panel) {
            return panel(this.#editor(), {label: this.properties.label || "Редактор"})
        }

        if (this.properties.label) {
            return labeled(this.#editor(), this.properties.label)
        }

        return this.#editor()
    })

    draw = () => this.#widget().render();
}

export const codeEditor = (properties?: CodeEditorProperties) => new ManagedCodeEditorWrapper(properties, Configuration)
