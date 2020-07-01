import {Widget} from "../widgets/Widget";
import {hashOf} from "../extensions/HashExtensions";

export const arrayCache = <T>(receiver: () => T[], factory: (elements: T[]) => Widget<any>) => {
    const cache = new Map<string, Widget<any>>()
    return () => {
        const elements = receiver();
        const hash = hashOf(elements);
        let widgets = cache.get(hash);
        if (widgets == undefined) {
            cache.set(hash, (widgets = factory(elements)))
        }
        return widgets;
    }
}
