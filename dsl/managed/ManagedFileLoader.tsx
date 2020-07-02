import {makeStyles, Theme} from "@material-ui/core";
import {isEmptyArray} from "../../extensions/extensions";
import {File, FilePond, FilePondProps} from "react-filepond";
import {ModuleFile} from "../../../model/ModuleTypes";
import * as React from "react";
import {Dispatch} from "react";
import {useNotifications} from "../../hooks/Hooks";
import {Widget} from "../../widgets/Widget";
import {Configurable} from "../../pattern/Configurable";
import "./ManagedFileLoader.css"

const useStyles = makeStyles((theme: Theme) => ({
        "@global": {
            ".filepond--drop-label": {
                backgroundColor: theme.palette.background.default,
                color: theme.palette.primary.main,
                fontFamily: theme.typography.h6.fontFamily,
                fontSize: theme.typography.h6.fontSize
            },
            ".filepond--file-action-button": {
                color: theme.palette.type == 'dark' ? theme.palette.common.black : theme.palette.common.white,
                backgroundColor: theme.palette.secondary.main
            },
            ".filepond--file-action-button:hover": {
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.secondary.main,
                cursor: "pointer"
            },
            ".filepond--panel-center": {
                backgroundColor: theme.palette.background.default,
            },
            ".filepond--panel-bottom": {
                backgroundColor: theme.palette.background.default,
            },
            ".filepond--panel-top": {
                backgroundColor: theme.palette.background.default,
            },
            ".filepond--file-info": {
                color: theme.palette.primary.main,
            },
            ".filepond--file-info .filepond--file-info-main": {
                fontFamily: theme.typography.body1.fontFamily,
                fontSize: theme.typography.body1.fontSize
            },
            ".filepond--file-info .filepond--file-info-sub": {
                display: "none"
            },
        }
    }),
);

type Properties = FilePondProps & {
    defaultFileNames?: string[]
    maxFilesCount: number
    maxFileSize: number
    maxFileSizeAsString: string
}

type FileProperties = {
    name: string
    bytes: Buffer
}

type FileError = {
    main: string;
    sub: string;
}

class Configuration extends Configurable<Properties> {
    // @ts-ignore
    loadedFiles = this.property(this.defaultProperties.defaultFileNames?.map(file => ({
        source: file,
        filename: file,
        options: {
            type: 'local',
            load: false,
            file: {name: file}
        }
    } as File)) || []);

    // @ts-ignore
    initialFiles = this.property(this.defaultProperties.defaultFileNames?.map(file => ({
        source: file,
        filename: file,
        options: {
            type: 'local',
            load: false,
            file: {name: file}
        }
    } as File)) || []);

    currentFiles = this.property(this.defaultProperties.defaultFileNames?.map(file => ({
        name: file,
        bytes: Buffer.alloc(0)
    }) as FileProperties) || []);
}

class ManagedFileLoader extends Widget<ManagedFileLoader, Properties, Configuration> {
    #notifications = this.hookValue(useNotifications);

    #loaded = isEmptyArray(this.properties.defaultFileNames);

    #loadedFilesCount = 0;

    #onNewFile = (error: FileError, file: File) => {
        if (this.#loaded) {
            this.#attachFile(file, error);
            return;
        }
        if ((this.#loadedFilesCount = this.#loadedFilesCount + 1) == this.configuration.initialFiles.value!.length) {
            this.#loaded = true;
            this.#attachFile(file, error);
            return;
        }
    };

    #attachFile = (file: File, error: FileError) => {
        if (!file && !error) {
            this.#notifications().error(`Ошибка загрузки файла`);
            this.notify();
            return;
        }
        if (!file && error) {
            this.#notifications().error(`Ошибка загрузки файла: [${error.main}]: ${error.sub}`);
            this.notify();
            return;
        }
        if (error) {
            this.#notifications().error(`Ошибка загрузки файла ${file.filename}: [${error.main}]: ${error.sub}`);
            this.notify();
            return
        }
        if (file.fileSize > this.properties.maxFileSize) {
            this.#notifications().error(`Слишком большой файл: ${file.filename}. Максимальный размер - ${this.properties.maxFileSizeAsString}`);
            this.configuration.loadedFiles.value = this.configuration.loadedFiles.value!.filter(currentFile => currentFile != file);
            this.notify();
            return;
        }
        if (file.fileSize == 0) {
            this.#notifications().warning(`Пустые файлы не допускаются: ${file.filename}`);
            this.configuration.loadedFiles.value = this.configuration.loadedFiles.value!.filter(currentFile => currentFile != file);
            this.notify();
            return;
        }
        const index = this.configuration.loadedFiles.value!.findIndex(current => current.filename == file.filename);
        if (index == -1) {
            this.configuration.loadedFiles.value = [...this.configuration.loadedFiles.value, file];
            this.#updateFiles();
            this.notify();
            return;
        }
        this.configuration.loadedFiles.value = [...this.configuration.loadedFiles.value]
        const files = [...this.configuration.loadedFiles.value]
        files[index] = file;
        this.configuration.loadedFiles.value = files
        this.#updateFiles();
        this.notify();
    };

    #beforeRemoveFile = (file: File) => {
        if (!file) {
            return true
        }
        this.configuration.loadedFiles.value = this.configuration.loadedFiles.value!.filter(currentFile => currentFile.filename != file.filename);
        this.#updateFiles();
        this.notify();
        return true
    };

    #updateFiles = () => {
        if (isEmptyArray(this.configuration.loadedFiles.value)) {
            this.configuration.currentFiles.value = [];
            return;
        }

        this.configuration.currentFiles.value = this.configuration.loadedFiles.value!.map(file => ({
            name: file.filename,
            bytes: Buffer.alloc(0)
        }));

        this.configuration.loadedFiles.value!.filter(file => file.file instanceof Blob).forEach(file => {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                const newFile = {
                    name: file.filename,
                    bytes: Buffer.from(fileReader.result as ArrayBuffer)
                };
                if (newFile.bytes.length <= 0) {
                    this.configuration.loadedFiles.value = this.configuration.loadedFiles.value!.filter(currentFile => currentFile.filename != file.filename);
                    if (isEmptyArray(this.configuration.loadedFiles.value)) {
                        this.configuration.currentFiles.value = [];
                        return;
                    }
                    this.configuration.currentFiles.value = this.configuration.loadedFiles.value!.map(file => ({
                        name: file.filename,
                        bytes: Buffer.alloc(0)
                    }));
                    this.notify()
                    return;
                }
                this.#addFile(newFile, currentFile => currentFile.name == file.filename)
            };
            fileReader.readAsArrayBuffer(file.file as Blob);
        })
    };

    #addFile = (file: ModuleFile, searcher: (file: ModuleFile) => boolean) => {
        if (isEmptyArray(this.configuration.loadedFiles.value)) {
            this.configuration.currentFiles.value = [file];
            return;
        }
        const currentFileIndex = this.configuration.currentFiles.value!.findIndex(searcher);
        if (currentFileIndex == -1) {
            this.configuration.currentFiles.value = [...this.configuration.currentFiles.value, file];
            return;
        }
        const files = [...this.configuration.currentFiles.value]
        files[currentFileIndex] = file;
        this.configuration.currentFiles.value = files
    };

    files = () => this.configuration.currentFiles.value;

    onFilesChanged = (action: Dispatch<FileProperties[]>) => {
        this.configuration.currentFiles.consume(action)
        return this;
    };

    useFiles = this.extract(configuration => configuration.currentFiles)

    clearFiles = () => {
        this.lock(() => this.configuration.currentFiles.value = this.configuration.loadedFiles.value = []);
        return this;
    }

    draw = () => {
        useStyles()
        const baseProperties = {...this.properties}
        delete baseProperties.defaultFileNames
        delete baseProperties.maxFilesCount
        delete baseProperties.maxFileSize
        delete baseProperties.maxFileSizeAsString
        return <FilePond
            {...baseProperties}
            files={this.configuration.loadedFiles.value}
            onaddfile={this.#onNewFile}
            beforeRemoveFile={this.#beforeRemoveFile}
            labelIdle={"Нажмите или поместите файлы сюда"}
            maxFiles={this.properties.maxFilesCount}
            allowMultiple
        />
    }
}

export const fileLoader = (properties: Properties) => new ManagedFileLoader(properties, Configuration)
