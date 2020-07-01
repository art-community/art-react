import {EffectCallback, useEffect} from "react";

export type Subscription = () => () => any;

export const subscribe = (effect: EffectCallback) => useEffect(effect, []);
