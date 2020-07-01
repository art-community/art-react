import React from "react";
import {Avatar, CircularProgress, useTheme} from "@material-ui/core";
import {observe} from "../../../pattern/Observable";
import {Widget} from "../../../widgets/Widget";
import {defer} from "../../../pattern/Deferred";
import {Configurable} from "../../../pattern/Configurable";

const useStyle = (progressBarColor?: string, letterBackground?: string, imageWidth?: number, imageHeight?: number) => {
    const theme = useTheme();
    return observe(theme, progressBarColor, imageWidth, imageHeight).render(() => ({
        textAvatar: {
            backgroundColor: letterBackground || theme.palette.secondary.main
        },
        imageAvatar: {
            width: imageWidth,
            height: imageHeight,
            overflow: 'visible',
        },
        avatarProgress: {
            color: progressBarColor ? progressBarColor : theme.palette.primary.main,
            animationDuration: "550ms"
        }
    }));
};

type ImageProperties = {
    icon: string
    width: number
    height: number
}

type ProgressProperties = {
    color?: string
}

type LetterProperties = {
    firstLetter: string
    background?: string
}

export type CardAvatarProperties = {
    progress?: ProgressProperties | boolean
    letter?: LetterProperties
    image?: ImageProperties
    icon?: Widget<any>
}

class Configuration extends Configurable<CardAvatarProperties> {
    avatar = this.property(this.defaultProperties)
}

export class CardAvatar extends Widget<CardAvatar, CardAvatarProperties, Configuration> {
    useAvatar = this.extract(configuration => configuration.avatar);

    setAvatar = (avatar: CardAvatarProperties) => {
        this.useAvatar(property => property.value = avatar);
        return this;
    };

    updateAvatar = (decorator: (current?: CardAvatarProperties) => CardAvatarProperties) => {
        this.useAvatar(property => property.value = decorator(property.value));
        return this;
    };

    draw = () => {
        const {icon, image, letter, progress} = this.configuration.avatar.value;

        const progressColor = typeof progress == "boolean" ? undefined : (progress as ProgressProperties)?.color;

        const style = useStyle(progressColor, letter?.background, image?.width, image?.height);

        const progressAvatar = defer(style)
        .render(() => <CircularProgress variant="indeterminate"
                                        disableShrink
                                        size={20}
                                        thickness={4}
                                        style={style.avatarProgress}/>);

        const letterAvatar = defer(style, letter)
        .render(() =>
            <Avatar key={"letterAvatar"} style={style.textAvatar}>
                {letter!.firstLetter.toUpperCase()}
            </Avatar>
        );

        const imageAvatar = defer(style, image)
        .render(() =>
            <Avatar key={"imageAvatar"} src={image!.icon} style={style.imageAvatar}/>
        );

        if (progress) {
            return progressAvatar;
        }

        if (icon) {
            return icon!.render();
        }

        if (letter) {
            return letterAvatar
        }

        if (image) {
            return imageAvatar
        }

        return <></>
    }
}

export const cardAvatar = (properties?: CardAvatarProperties) => new CardAvatar(properties, Configuration);
