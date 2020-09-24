import React from 'react';
import {HookContainer} from './HookContainer';

type Properties = {
    factory: () => JSX.Element,
};

export const Render = (properties: Properties) => <>{properties.factory()}</>;
