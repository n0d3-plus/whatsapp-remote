// Dynamically import Vite only in development
import { createServer } from 'vite';
import { APP } from './listeners';

const VITE = await createServer({
    server: { middlewareMode: true },
})

// Use Vite's connect instance as middleware
APP.use(VITE.middlewares)
