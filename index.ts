import * as ReactDOM from "react-dom";
import {button} from "./dsl/managed/ManagedButton";
import {MAIN_COMPONENT} from "./constants/Constants";
import {horizontalGrid} from "./dsl/managed/ManagedGrid";
import {label} from "./dsl/managed/ManagedLabel";
import {information} from "./dsl/managed/ManagedDialog";

window.addEventListener("beforeunload", event => {
    event.preventDefault();
});

let informationDialog = information({information: "Инфо", label: "Информация", buttonLabel: "ОК"});
const widget = horizontalGrid({alignItems: "center", spacing: 2})
    .pushWidget(label({text: "Это кнопка:"}))
    .pushWidget(button({
            label: "Кнопка",
            variant: "contained"
        }).onClick(() => informationDialog.useVisible(visible => visible.set(!visible.value)))
    )
    .add(informationDialog);
ReactDOM.render(widget.render(), document.getElementById(MAIN_COMPONENT));
