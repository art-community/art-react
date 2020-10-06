import {useRef} from "react";

export const hooksEnabled = () => {
    try {
        useRef();
        return true
    } catch (exception) {
        console.warn("Hooks disabled\n", exception);
        return false
    }
};
