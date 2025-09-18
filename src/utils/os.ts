import { execSync, exec } from "node:child_process";
import { platform } from "node:os";

export function messageBox(message, title = "Error") {
    console.error(message);
    const osPlatform = platform();
    try {
        if (osPlatform === 'win32') {
            execSync(`mshta "javascript:alert('${message.replace(/'/g, "\\'")}');close()"`);
        } else if (osPlatform === 'darwin') {
            execSync(`osascript -e 'display dialog "${message}" with title "${title}" buttons {"OK"}'`);
        } else if (osPlatform === 'linux') {
            execSync(`zenity --error --title="${title}" --text="${message}"`);
        }
    } catch (err) {
        console.debug('Failed to show GUI dialog');
    }
}

/**
 * Opens a given URL in the default web browser,
 * compatible across Windows, macOS, and Linux.
 *
 * @param url The URL to open (e.g., "https://www.google.com").
 * @returns A Promise that resolves if the URL is opened successfully,
 * or rejects with an error if the command fails or the OS is not supported.
 */
export function openBrowser(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        let command: string;

        // Determine the command based on the operating system
        switch (process.platform) {
            case 'darwin': // macOS
                command = `open ${url}`;
                break;
            case 'win32': // Windows
                command = `start ${url}`;
                break;
            case 'linux': // Linux
                command = `xdg-open ${url}`;
                break;
            default:
                // If the OS is not recognized, reject the promise
                return reject(new Error(`Unsupported operating system: ${process.platform}`));
        }

        // Execute the command
        exec(command, (error) => {
            if (error) {
                // If there's an error during execution, reject the promise
                console.error(`Failed to open URL: ${url}. Error: ${error.message}`);
                // reject(error);
            } else {
                resolve();
            }
        });
    });
}