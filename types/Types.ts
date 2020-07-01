import {Configurable} from "../pattern/Configurable";

export type ConstructorType<T> = new (...args: any[]) => T;

export type ConfigurationToSubject<ConfigurationType extends Configurable<unknown>, Subject extends any> =
    (configuration: ConfigurationType) => Subject;

export type SubjectUser<Subject extends any> =
    (subject: Subject) => any;
