import { existsSync, readFileSync } from "node:fs";
import os from "node:os"
import path, { resolve } from "node:path";
import type { Page } from "puppeteer-core";
import config from "../config";

export function getBrowserPath(): string | null {
    // Detect command line args
    const args = process.argv.slice(2);
    const browserPathArg = args.find(arg => arg.startsWith('--browser='));
    const cliPath = browserPathArg?.split('=')[1];

    if (cliPath) {
        if (existsSync(cliPath)) {
            return cliPath;
        }
        console.debug(`Browser specified by user is not exists: ${cliPath}, fallback to auto detect.`)
    }

    const platform = os.platform();

    if (platform === 'win32') {
        const winPaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
        ];
        return winPaths.find(p => existsSync(p)) || null;
    }

    if (platform === 'darwin') {
        const macPaths = [
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ];
        return macPaths.find(p => existsSync(p)) || null;
    }

    if (platform === 'linux') {
        const linuxPaths = [
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
        ];
        return linuxPaths.find(p => existsSync(p)) || null;
    }
    return null;
}

export async function injectVersionLock(page: Page) {
    let indexHtmlFile = path.resolve(import.meta.dirname, '../waweb/index.html')
    if (!existsSync(indexHtmlFile)) {
        console.warn(`Wa Web Index not exist, NO version locking`, indexHtmlFile)
        return
    }
    console.debug('Intercept for version locking..')
    const indexURL = 'https://web.whatsapp.com/';
    const content = readFileSync(indexHtmlFile)
    let interceptor = (req) => {
        if (req.url() !== indexURL)
            return req.continue();

        req.respond({
            status: 200,
            contentType: 'text/html',
            body: content
        })
        page.off('request', interceptor)
        page.setRequestInterception(false)
        console.debug('Version lock done.')
    }
    await page.setRequestInterception(true);
    page.on('request', interceptor);

}

export async function injectRemote(page: Page) {

    await page.setBypassCSP(true)
    const scripts: string[] = []
    // Inject Our script
    if (config.isLiveDev) {
        let viteFsRoot = resolve(process.cwd(), 'remote')
        scripts.push(
            `http://127.0.0.1:${config.listenPort}/@vite/client`,
            `http://127.0.0.1:${config.listenPort}/@fs${viteFsRoot}/index.ts`
        )
    } else {
        // untested
        scripts.push(`http://127.0.0.1:${config.listenPort}/remote/index.js`);
    }

    await page.evaluateOnNewDocument((srcs: string[]) => {
        window.addEventListener('DOMContentLoaded', () => {
            console.log('✅ inject remote ON');
            const _f = (s) => {
                const script = document.createElement('script');
                script.type = 'module'
                script.src = s
                document.documentElement.appendChild(script);
            }
            srcs.forEach(_f)
        });
    }, scripts);
}