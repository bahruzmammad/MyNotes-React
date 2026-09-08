import "dotenv/config"

import { serve } from "@hono/node-server"

import app from "./src/app.js"

const port = Number(process.env.PORT) || 5000

serve({
    fetch: app.fetch,
    port,
})
