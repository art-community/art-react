import * as ReactDOM from "react-dom";
import {button} from "./dsl/managed/ManagedButton";
import {MAIN_COMPONENT} from "./constants/Constants";
import {horizontalGrid, verticalGrid} from "./dsl/managed/ManagedGrid";
import {label} from "./dsl/managed/ManagedLabel";
import {information} from "./dsl/managed/ManagedDialog";
import {text} from "./dsl/managed/ManagedTextField";
import {checkBoxPanel} from "./dsl/managed/ManagedPanel";
import {tooltip} from "./dsl/simple/SimpleTooltip";

window.addEventListener("beforeunload", event => {
    event.preventDefault();
});

let informationDialog = information({information: "Инфо", label: "Информация", buttonLabel: "ОК"});
const widget = verticalGrid({spacing: 2})
    .pushWidget(label({text: "Это кнопка:"}))
    .pushWidget(button({
            label: "Кнопка",
            variant: "contained"
        }).onClick(() => informationDialog.useVisible(visible => visible.set(!visible.value)))
    )
    .pushWidget(checkBoxPanel(tooltip({placement: "top-start"})
        .widget(text({label: "MyText", fullWidth: true}).onTextChanged(console.log))
        .title(label("Test")), {
        label: "Test"
    })
    .add(informationDialog))
;
ReactDOM.render(widget.render(), document.getElementById(MAIN_COMPONENT));
