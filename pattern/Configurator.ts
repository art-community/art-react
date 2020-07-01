import {Widget} from "../widgets/Widget";

export interface Configurator<T> extends Widget<any>{
    configure(): T
}
