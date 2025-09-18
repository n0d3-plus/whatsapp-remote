// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, md } from 'vuetify/iconsets/md'

const vuetify = createVuetify({
    icons: {
        defaultSet: 'md',
        aliases,
        sets: {
            md,
        },
    },
    theme: {
        defaultTheme: localStorage.getItem('mode') === 'light' ? 'light' : 'dark'
    }
})
export default vuetify