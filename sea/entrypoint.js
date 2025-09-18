// sea entrypoint
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { pathToFileURL } = require("node:url");

const APP_NAME = "__APP_NAME__" || 'whatsapp-remote';
const APP_VERSION = "__APP_VERSION__";

function getDataDir() {
    if (process.platform === "win32") {
        return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), APP_NAME);
    }
    const xdg = process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share");
    return path.join(xdg, APP_NAME);
}

function fileExists(p) {
    try { return fs.statSync(p).isFile() || fs.statSync(p).isDirectory(); }
    catch { return false; }
}
/**
 * @param {Blob} blob 
 * @param {string} destDir 
 */
async function extractTarGz(blob, destDir) {
    const zlib = require("node:zlib");
    const buffer = Buffer.from(await blob.arrayBuffer());
    const tarData = zlib.gunzipSync(buffer);

    let offset = 0;
    while (offset < tarData.length) {
        const header = tarData.slice(offset, offset + 512);
        offset += 512;
        const name = header.toString("utf8", 0, 100).replace(/\0.*$/, "");
        if (!name) {
            console.log('Extract done.')
            break; // End of archive
        }
        const sizeOctal = header.toString("utf8", 124, 136).replace(/\0.*$/, "").trim();
        const size = parseInt(sizeOctal, 8) || 0;
        const fileContent = tarData.slice(offset, offset + size);
        offset += Math.ceil(size / 512) * 512;

        const outPath = path.join(destDir, name);
        if (name.endsWith("/")) {
            fs.mkdirSync(outPath, { recursive: true });
        } else {
            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, fileContent);
        }
    }
}

async function main() {
    const dataDir = getDataDir();
    const destDir = path.join(dataDir, 'app');
    let needExtract = false;
    const installedPkgPath = path.join(destDir, "package.json");
    if (!fileExists(installedPkgPath)) {
        needExtract = true;
    } else {
        try {
            const installedPkg = JSON.parse(fs.readFileSync(installedPkgPath, "utf8"));
            if (installedPkg.version !== APP_VERSION) needExtract = true;
        } catch {
            needExtract = true;
        }
    }

    if (needExtract) {
        const { getAssetAsBlob } = require("node:sea");
        console.log("Extracting app to", destDir);
        fs.rmSync(destDir, { recursive: true, force: true });
        fs.mkdirSync(destDir, { recursive: true });
        const blob = getAssetAsBlob("app.tar.gz");
        await extractTarGz(blob, destDir);
    }
    const f = pathToFileURL(path.join(destDir, "index.js")).href
    console.log('Runing main', f, path.join(destDir, "index.js"), destDir)
    return await import(f)
}

if (process.env.IS_RUNNER || process.argv.some(v => v.includes('runner'))) {

    const importFile = pathToFileURL(process.argv.at(-1)).href + '.js'
    import(importFile)
} else if (process.argv.at(-1).includes('.js')) {
    const importFile = pathToFileURL(process.argv.at(-1)).href
    console.log('Running', importFile)
    import(importFile)
} else {
    main();
}
