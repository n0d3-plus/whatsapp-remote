import { registerAction } from "../action-register"
import { Break } from "../action-utils"


registerAction(
    {
        name: 'Send to n8n',
        type: 'remote',
        configs: {
            url: {
                label: "n8n Webhook URL",
                type: "TEXT",
            },
            method: {
                options: ['GET', 'POST', 'HEAD'],
                default: 'POST',
                type: "SELECT",
            },
            testMode: {
                label: "n8n Test mode",
                type: "CHECKBOX"
            }
        },
        consumes: {
            msg: {
                type: 'MESSAGE',
            }
        },
        produces: {
            response: {
                type: 'ANY'
            }
        }
    },
    async (configs, consumes, store, console, api) => {

        if (!configs.url) {
            throw new Error('Empty URL')
        }
        let url = configs.url

        if (configs.testMode) {
            url = url.replace('/webhook-test/', '/webhook-test/')
        } else {
            url = url.replace('/webhook-test/', '/webhook/')
        }

        const reqInit: RequestInit = {
            method: configs.method || 'GET',
            keepalive: false
        }
        if (reqInit.method == 'POST') {
            reqInit.body = JSON.stringify({ msg: consumes.msg })
            reqInit.headers = { "Content-Type": "application/json" }
        } else {
            url += '?msg=' + encodeURIComponent(JSON.stringify(consumes.msg))
        }

        console.log(`${reqInit.method} ${url}`)
        const response = await fetch(url, reqInit).then(
            r => {
                console.debug('Response', r.status, r.statusText)
                return r.text()
            }
        )
        return { response }
    }
)
