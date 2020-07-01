import React from 'react';
import {HookContainer} from './HookContainer';

type Properties = {
    factory: () => JSX.Element,
    hooks?: HookContainer
};

export const Render = (properties: Properties) => {
    properties.hooks?.evaluate();
    return <>{properties.factory()}</>;
};
