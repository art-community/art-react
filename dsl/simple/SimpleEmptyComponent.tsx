import React from 'react';
import {Widget} from "../../widgets/Widget";

export class SimpleEmptyComponent extends Widget<SimpleEmptyComponent> {
    draw = () => <></>;
}

export const empty = () => new SimpleEmptyComponent();
