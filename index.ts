import * as ReactDOM from "react-dom";
import {button} from "./dsl/managed/ManagedButton";
import {MAIN_COMPONENT} from "./constants/Constants";
import {horizontalGrid, verticalGrid} from "./dsl/managed/ManagedGrid";
import {label} from "./dsl/managed/ManagedLabel";
import {information} from "./dsl/managed/ManagedDialog";
import {text} from "./dsl/managed/ManagedTextField";
import {form} from "./widgets/Form";
import {group} from "./dsl/simple/SimpleGroup";
import {lazy} from "./pattern/Lazy";
import {provideTheme} from "./dsl/managed/ManagedThemeProvider";
import {createMuiTheme} from "@material-ui/core";
import {blue} from "@material-ui/core/colors";

const informationDialog = information({information: "Инфо", label: "Информация", buttonLabel: "ОК"});
const tooltipText = label("Test");


const managedDialog = lazy(() => information({
    information: "Сохранено",
    label: "Информация",
    buttonLabel: "ОК",
    visible: true
}));

const widget1 = label({text: "Форма", variant: "h3"});

const widget2 = horizontalGrid({spacing: 1}).breakpoints({xs: true})
.pushWidget(text({label: "Имя", fullWidth: true}))
.pushWidget(text({label: "Фамилия", fullWidth: true}));

const widget3 = text({label: "Дата рождения", fullWidth: true});

const widget4 = button({label: "Сохранить", variant: "contained", fullWidth: true})
.onClick(managedDialog().open)
.onClick(() => widget4.setColor("secondary"));

const formWidget = form(
    group()
    .widget(widget1)
    .widget(
        verticalGrid({spacing: 1}).breakpoints({xs: 6})
        .pushWidget(widget2)
        .pushWidget(widget3)
        .pushWidget(widget4)
        .add(managedDialog())
    )
);

let theme = createMuiTheme({
    palette: {
        secondary: {
            main: blue.A100
        }
    }
});

const themed = provideTheme(theme, formWidget);
ReactDOM.render(themed.render(), document.getElementById(MAIN_COMPONENT));
