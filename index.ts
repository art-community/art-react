import * as ReactDOM from "react-dom";
import {button} from "./dsl/managed/ManagedButton";
import {MAIN_COMPONENT} from "./constants/Constants";
import {horizontalGrid, verticalGrid} from "./dsl/managed/ManagedGrid";
import {label} from "./dsl/managed/ManagedLabel";
import {information} from "./dsl/managed/ManagedDialog";
import {text} from "./dsl/managed/ManagedTextField";
import {checkBoxPanel} from "./dsl/managed/ManagedPanel";
import {tooltip} from "./dsl/simple/SimpleTooltip";
import {form} from "./widgets/Form";
import {group} from "./dsl/simple/SimpleGroup";
import {lazy} from "./pattern/Lazy";

const informationDialog = information({information: "Инфо", label: "Информация", buttonLabel: "ОК"});
const tooltipText = label("Test");

const widget = verticalGrid({spacing: 2})
    .pushWidget(label({text: "Это кнопка:"}))
    .pushWidget(button({
            label: "Кнопка",
            variant: "contained"
        }).onClick(() => informationDialog.useVisible(visible => visible.set(!visible.value)))
    )
    .pushWidget(checkBoxPanel(tooltip({placement: "top-start"})
        .widget(text({label: "MyText", fullWidth: true}).onTextChanged(console.log).onTextChanged(tooltipText.setText))
        .title(tooltipText), {label: "Test"})
    )
    .add(informationDialog);


let managedDialog = lazy(() => information({
    information: "Сохранено",
    label: "Информация",
    buttonLabel: "ОК",
    visible: true
}));

let widget1 = label({text: "Форма", variant: "h3"});

let widget2 = horizontalGrid({spacing: 1}).breakpoints({xs: true})
    .pushWidget(text({label: "Имя", fullWidth: true}))
    .pushWidget(text({label: "Фамилия", fullWidth: true}));

let widget3 = text({label: "Дата рождения", fullWidth: true});

let widget4 = button({label: "Сохранить", variant: "contained", fullWidth: true}).onClick(managedDialog().open);

const formWidget = form(
    group()
        .widget(widget1)
        .widget(verticalGrid({spacing: 1}).breakpoints({xs: 6})
            .pushWidget(widget2).pushWidget(widget3).pushWidget(widget4)
            .add(managedDialog()))
);
ReactDOM.render(formWidget.render(), document.getElementById(MAIN_COMPONENT));
