import {Configurable} from "../pattern/Configurable";
import {useRef, useState} from "react";
import {Trigger} from "../pattern/Trigger";
import {hooksEnabled} from "../extensions/HooksDeterminer";
import {useSnackbar} from "notistack";
import {Notifications} from "../extensions/Notifications";
import {useHistory} from "react-router";

export const useTriggerState = (configurable: Configurable<unknown>) => {
    const [state, setState] = useState<number>(0);
    const trigger = useRef<Trigger>();
    if (trigger.current) {
        return state;
    }
    trigger.current = trigger.current || new Trigger(setState);
    configurable.bindTrigger(trigger.current);
    return state;
};

export const useNotifications = () => hooksEnabled()
    ? Notifications.notifications(useSnackbar())
    : Notifications.notifications();

export function useHistoryProps<T>() {
    const history = useHistory<T>();
    return history.location.state
}
