import {useRef} from "react";

export const hooksEnabled = () => {
    try {
        useRef();
        return true
    } catch (e) {
        console.warn("Hooks disabled\n", e);
        return false
    }
};