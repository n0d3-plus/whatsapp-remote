import fs from 'node:fs';
import readline from 'node:readline';

export class LogWatcher {
    private filePath: string;
    private position: number = 0;
    private watcher?: fs.FSWatcher;
    private onDataCallback?: (line: string) => void;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    /**
     * Read the last N lines of the file
     */
    async readLastLines(n: number): Promise<string[]> {
        const lines: string[] = [];
        const stream = fs.createReadStream(this.filePath, { encoding: 'utf8' });

        const rl = readline.createInterface({ input: stream });
        for await (const line of rl) {
            lines.push(line);
            if (lines.length > n) {
                lines.shift();
            }
        }
        return lines;
    }

    /**
     * Start watching file for new lines
     */
    watch(onData: (line: string) => void) {
        this.onDataCallback = onData;

        // Find current file size (so we only read new data)
        this.position = fs.existsSync(this.filePath)
            ? fs.statSync(this.filePath).size
            : 0;

        this.watcher = fs.watch(this.filePath, (eventType) => {
            if (eventType === 'change') {
                this.readNewData();
            }
        });
    }

    /**
     * Read new data from file since last position
     */
    private readNewData() {
        const stats = fs.statSync(this.filePath);
        if (stats.size < this.position) {
            // File was truncated or rotated
            this.position = 0;
        }
        if (stats.size > this.position) {
            const stream = fs.createReadStream(this.filePath, {
                start: this.position,
                end: stats.size,
                encoding: 'utf8'
            });

            let buffer = '';
            stream.on('data', (chunk) => {
                buffer += chunk;
                let lines = buffer.split(/\r?\n/);
                buffer = lines.pop() || '';
                lines.forEach((line) => this.onDataCallback?.(line));
            });

            stream.on('end', () => {
                this.position = stats.size;
            });
        }
    }

    /**
     * Stop watching file
     */
    close() {
        this.watcher?.close();
        this.watcher = undefined;
    }
}
