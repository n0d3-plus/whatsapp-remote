import fs from "node:fs";
import config from "./config";
import { openBrowser } from "./utils/os";
import { SERVER } from "./server/listeners";
import { MANAGER } from "./remote/manager";
import "./server/websocket"
import "./server/handler"


if (!fs.existsSync(config.dataDir)) {
  console.debug(`Creating data dir: ${config.dataDir}`)
  fs.mkdirSync(config.dataDir, { recursive: true })
}

process.on('SIGTERM', async () => {
  console.debug('Exiting..')
  await MANAGER.close()
  await SERVER.close()
  console.debug('All closed')
  process.exit(0)
})

MANAGER.init().catch(
  err => console.error(err)
)

SERVER.listen(config.listenPort, '127.0.0.1', () => {
  console.log(`[BACKEND] Server started http://127.0.0.1:${config.listenPort}`);
  if (!config.isLiveDev) {
    openBrowser(`http://127.0.0.1:${config.listenPort}`)
  }
})