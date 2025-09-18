import type { ConfigItem } from "@src/types/action-types";
import { h, type Component } from "vue";
import List from "./editors/List.vue";
import Code from "./editors/Code.vue";
import { VCheckbox, VSelect, VTextField } from "vuetify/components";
import Phone from "./editors/Phone.vue";

const baseClass = 'my-2'
const baseProps: VTextField['$props'] = {
    hideDetails: true,
    density: 'compact',
    variant: 'outlined',
    class: baseClass
}

export function useConfigComponent(config: ConfigItem) {
    let component: Component
    let props: Record<string, any>
    switch (config.type) {
        case "SELECT":
            component = VSelect
            props = { ...baseProps, items: config.options }
            break;
        case "CHECKBOX":
            props = { ...baseProps, class: "mb-1 mt-0" }
            component = VCheckbox
            break
        case "LIST":
            props = { class: baseClass }
            component = List
            break
        case "CODE":
            props = { class: baseClass }
            component = Code
            break
        case "PHONE":
            props = { ...baseProps }
            component = Phone
            break
        case "TEXT":
        default:
            props = { ...baseProps }
            component = VTextField
            break
    }

    return (attrs, ...rest: any[]) =>
        h(component, { ...props, ...attrs }, ...rest)
}