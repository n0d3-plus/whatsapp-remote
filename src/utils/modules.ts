import { readdirSync } from "node:fs";
import path from "node:path";

export async function importAll<T = any>(directory: string) {
    const absolutePath = path.resolve(directory);
    const files = readdirSync(absolutePath);

    for (const file of files) {
        const ext = path.extname(file);
        if (!['.ts', '.js', '.mjs'].includes(ext)) continue;

        const modulePath = path.join(absolutePath, file);
        console.debug(`Importing ${file}`)
        await import(modulePath);
    }
}