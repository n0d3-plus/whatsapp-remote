import { Transform } from 'node:stream';

// helper to create transform that formats lines
export function lineTransform(label) {
    let strBuf = '';
    return new Transform({
        transform(chunk: Buffer, _enc, cb) {
            strBuf += chunk.toString('utf-8');
            let lines = strBuf.split('\n');
            strBuf = lines.pop() || ''; // keep incomplete line
            for (const line of lines) {
                this.push(`${Date.now()} ${label} ${line}\n`);
            }
            cb();
        },
        flush(cb) {
            if (strBuf.length > 0) {
                const ts = new Date().toISOString();
                this.push(`${ts} ${label} ${strBuf}\n`);
            }
            cb();
        }
    });
}