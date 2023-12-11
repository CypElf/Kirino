import { t } from "../../lib/misc/i18n"

export function success(message: string) {
    return `${message} ${t("common:kirino_glad")}`
}

export function error(message: string) {
    return `${message} ${t("common:kirino_pout")}`
}

export function denied(message: string) {
    return `${message} ${t("common:kirino_pff")}`
}

export function what(message: string) {
    return `${message} ${t("common:kirino_what")}`
}