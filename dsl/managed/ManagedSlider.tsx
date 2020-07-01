import {Slider, SliderProps} from "@material-ui/core";
import React, {Dispatch} from "react";
import {Configurable} from "../../pattern/Configurable";
import {Widget} from "../../widgets/Widget";
import {fromSliderEvent} from "../../constants/Constants";
import {range} from "../../extensions/extensions";

type Properties = SliderProps & {
    selectedValue?: number
    minValue: number
    maxValue: number
    step: number
    markFactory: (value: number) => Widget<any>
}

class Configuration extends Configurable<Properties> {
    selectedValue = this.property(this.defaultProperties.selectedValue);
}

export class ManagedSlider extends Widget<ManagedSlider, Properties, Configuration> {
    useSelectedValue = this.extract(configuration => configuration.selectedValue);

    selectedValue = () => this.configuration.selectedValue.value;

    selectValue = (value: number) => this.useSelectedValue(selected => selected.value = value);

    onChange = (action: Dispatch<number>) => {
        this.configuration.selectedValue.consume(action)
        return this;
    }

    draw = () => {
        const baseProperties = {...this.properties}
        delete baseProperties.selectedValue
        delete baseProperties.maxValue
        delete baseProperties.minValue
        delete baseProperties.markFactory
        delete baseProperties.step
        return <Slider {
                           ...{
                               ...baseProperties,
                               value: this.configuration.selectedValue.value == undefined
                                   ? this.properties.minValue
                                   : this.configuration.selectedValue.value,
                               onChange: fromSliderEvent(this.configuration.selectedValue.set),
                               marks: range(this.properties.maxValue, this.properties.minValue, this.properties.step)
                               .map(mark => ({
                                   value: mark,
                                   label: this.properties.markFactory(mark).render()
                               })),
                               min: this.properties.minValue,
                               max: this.properties.maxValue,
                               color: "secondary"
                           }
                       }
        />;
    };
}

export const slider = (properties: Properties) => new ManagedSlider(properties, Configuration)
