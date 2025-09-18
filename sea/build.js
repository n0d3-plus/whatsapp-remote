#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { pipeline } from "node:stream/promises";
import os from "os";
import pkg from "../package.json"  with { type: 'json' };
import { inject } from 'postject';
import * as tar from "tar";
import AdmZip from 'adm-zip';
import { Readable } from "node:stream";


const NODE_BIN = process.execPath || execSync("which node").toString().trim();
const APP_VERSION = pkg.version;
const APP_NAME = pkg.name || 'whatsapp-remote';

// This script dir
const SEA_DIR = import.meta.dirname
const ROOT_DIR = path.dirname(SEA_DIR)
const BUILD_DIR = path.join(ROOT_DIR, "build")
const DIST_DIR = path.join(ROOT_DIR, "dist")
const NODES_DIR = path.join(process.cwd(), 'tmp', "nodes")
const DIST_APP_DIR = path.join(DIST_DIR, "app")

const TAR_PATH = path.join(DIST_DIR, "app.tar.gz");
const SEA_CONFIG = path.join(DIST_DIR, "sea-config.json");
const SEA_BLOB = path.join(DIST_DIR, "sea-prep.blob");

const ENTRY_TEMPLATE = path.join(SEA_DIR, "entrypoint.js");
const ENTRY_GENERATED = path.join(DIST_DIR, "sea-entrypoint.js");

const OSes = [
    {
        name: 'linux-x64', binary: '', ext: '',
        url: 'https://nodejs.org/dist/v22.19.0/node-v22.19.0-linux-x64.tar.gz',
    },
    {
        name: 'darwin-arm64', binary: '', ext: '',
        url: 'https://nodejs.org/dist/v22.19.0/node-v22.19.0-darwin-arm64.tar.gz',
    },
    {
        name: 'win-x64', binary: '', ext: '.exe',
        url: 'https://nodejs.org/dist/v22.19.0/node-v22.19.0-win-x64.zip',
    }
]

/**
 * @param {string} url 
 * @param {string} target 
 */
async function download(url, target, ext) {
    const archive_name = path.basename(url)// url.match(/\/([^\/]+)$/)[1]
    const downladed = path.join(NODES_DIR, archive_name)
    if (!fs.existsSync(downladed)) {
        console.log('GET %s to %s', url, downladed)
        const res = await fetch(url);
        if (!res.ok || !res.body) {
            throw new Error(`Failed to download: ${res.status} ${res.statusText}`);
        }
        await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(downladed))
    }

    const archive_dir = archive_name.replace(/\.(zip|tar)(\.gz)?$/, '')
    const node_binary = 'node' + ext

    console.log('Extracting %s/%s as %s', archive_dir, node_binary, target)

    if (url.endsWith(".tar.gz")) {
        await tar.extract({
            cwd: NODES_DIR,
            gzip: true,
            file: downladed,
        })
        const extractDir = path.join(NODES_DIR, archive_dir)
        fs.copyFileSync(path.join(extractDir, 'bin', node_binary), target);
        fs.rmSync(extractDir, { recursive: true, force: true })
    } else if (url.endsWith(".zip")) {
        const zip = new AdmZip(downladed);
        const data = zip.readFile(archive_dir + '/node.exe');
        if (!data) {
            throw new Error(`Missing node executable: ${archive_dir}`);
        }
        fs.writeFileSync(target, data);
    }
    else {
        throw new Error(`Unsupported archive type: ${url}`);
    }

}
fs.mkdirSync(NODES_DIR, { recursive: true })
for (const v of OSes) {
    v.binary = path.join(NODES_DIR, `node-${v.name}${v.ext}`)
    if (fs.existsSync(v.binary)) continue
    await download(v.url, v.binary, v.ext)
}

if (!process.argv.includes('-n')) {
    fs.rmSync(DIST_APP_DIR, { recursive: true, force: true });
    fs.mkdirSync(DIST_APP_DIR, { recursive: true });
    // copy build + package.json
    execSync(`cp -a ${BUILD_DIR}/. ${DIST_APP_DIR}/`);
    fs.copyFileSync(path.join(ROOT_DIR, "package.json"), path.join(DIST_APP_DIR, "package.json"));
    fs.copyFileSync(path.join(ROOT_DIR, "package-lock.json"), path.join(DIST_APP_DIR, "package-lock.json"));

    // install prod deps
    execSync(
        "npm clean-install --no-progress --omit=dev --ignore-scripts --no-audit --no-bin-links --no-fund",
        {
            cwd: DIST_APP_DIR,
            stdio: "inherit"
        }
    );
    // create tar.gz
    await tar.create({
        file: TAR_PATH,
        cwd: DIST_APP_DIR,
        gzip: true,
        portable: true,
    }, ['.'])
    // execSync(`tar -czf ${TAR_PATH} --exclude="node_modules/.bin" -C ${DIST_APP_DIR} .`);
}

// prepare entrypoint
let entrySrc = fs.readFileSync(ENTRY_TEMPLATE, "utf8");
entrySrc = entrySrc.replace("__APP_NAME__", APP_NAME).replace("__APP_VERSION__", APP_VERSION);
fs.writeFileSync(ENTRY_GENERATED, entrySrc);

// create sea-config.json
fs.writeFileSync(SEA_CONFIG, JSON.stringify({
    main: ENTRY_GENERATED,
    output: SEA_BLOB,
    disableExperimentalSEAWarning: true,
    execArgvExtension: 'cli',
    assets: { "app.tar.gz": TAR_PATH }
}, null, 2));

// build SEA blob
execSync(`${NODE_BIN} --experimental-sea-config ${SEA_CONFIG}`, { stdio: "inherit" });
const SEA_DATA = fs.readFileSync(SEA_BLOB)

for (const v of OSes) {

    // inject blob into node binary
    const OUT_BINARY = path.join(DIST_DIR, APP_NAME + '-' + v.name + v.ext);
    fs.copyFileSync(v.binary, OUT_BINARY)

    await inject(OUT_BINARY, 'NODE_SEA_BLOB', SEA_DATA, {
        sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'
    })
    console.log("Created executable:", OUT_BINARY);
}


