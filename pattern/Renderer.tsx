import React from 'react';
import {HookContainer} from './HookContainer';

type Properties = {
    factory: () => JSX.Element,
};

export const Renderer = (properties: Properties) => <>{properties.factory()}</>;
