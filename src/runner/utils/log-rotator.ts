import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

export async function logRotator(logFile: string/* -/-/session-name.log */, maxSizeKiB = 1024) {
    let stats: fs.Stats
    try {
        stats = fs.statSync(logFile);
    } catch (error) {
        return // Not exists?
    }

    if (stats.size < maxSizeKiB * 1024) {
        return // console.log(`Log file is ${stats.size} bytes (< 1MB), no rotation needed.`);
    }

    const logBasename = path.dirname(logFile) + path.sep + path.basename(logFile, '.log')
    const logFileOld = logBasename + '.old.log'

    // Step 1: If old log exists → compress to numbered gz
    if (fs.existsSync(logFileOld)) {
        let counter = 1
        let logGziped: string
        do {
            logGziped = `${logBasename}.old${counter++}.gz`
        } while (fs.existsSync(logGziped))

        await new Promise<void>((resolve, reject) => {
            const gzip = zlib.createGzip()
            const source = fs.createReadStream(logFileOld)
            const destination = fs.createWriteStream(logGziped)
            source
                .pipe(gzip)
                .pipe(destination)
                .on('finish', resolve)
                .on('error', reject)
        })

        fs.unlinkSync(logFileOld)
    }

    // Step 2: If main log exists → rename to old log
    if (fs.existsSync(logFile)) {
        fs.renameSync(logFile, logFileOld)
    }
}
