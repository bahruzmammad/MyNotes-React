const colors = {
    reset: "\x1b[0m",

    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    brightBlack: "\x1b[90m",
    brightRed: "\x1b[91m",
    brightGreen: "\x1b[92m",
    brightYellow: "\x1b[93m",
    brightBlue: "\x1b[94m",
    brightMagenta: "\x1b[95m",
    brightCyan: "\x1b[96m",
    brightWhite: "\x1b[97m",
}

function getTime() {
    return new Date().toLocaleTimeString("az-AZ", {
        hour12: false,
    })
}
function formatMessage(level, message, color) {
    return (
        `${colors.brightBlack}[${getTime()}]${colors.reset} ` +
        `${color}[${level}]${colors.reset} ` +
        `${message}`
    )
}

export const log = {
    info(message) {
        console.log(formatMessage("INFO", message, colors.brightCyan))
    },

    success(message) {
        console.log(formatMessage("SUCCESS", message, colors.brightGreen))
    },

    warn(message) {
        console.warn(formatMessage("WARN", message, colors.brightYellow))
    },

    error(message) {
        console.error(formatMessage("ERROR", message, colors.brightRed))
    },

    debug(message) {
        console.log(formatMessage("DEBUG", message, colors.brightMagenta))
    },

    request(method, url, status, duration) {
        console.log(
            `${colors.brightBlack}[${getTime()}]${colors.reset} ` +
                `${colors.brightBlue}[REQUEST]${colors.reset} ` +
                `${colors.brightMagenta}${method}${colors.reset} ` +
                `${colors.brightWhite}${url}${colors.reset} ` +
                `${colors.brightGreen}${status}${colors.reset} ` +
                `${colors.brightBlack}(${duration}ms)${colors.reset}`,
        )
    },

    database(message) {
        console.log(formatMessage("DATABASE", message, colors.brightBlue))
    },

    server(message) {
        console.log(formatMessage("SERVER", message, colors.brightGreen))
    },

    route(method, path) {
        console.log(
            `${colors.brightBlack}[${getTime()}]${colors.reset} ` +
                `${colors.brightCyan}[ROUTE]${colors.reset} ` +
                `${colors.brightMagenta}${method}${colors.reset} ` +
                `${colors.brightWhite}${path}${colors.reset}`,
        )
    },
}

export function printServerInfo(port) {
    console.log("")

    console.log(`${colors.brightCyan}========================================${colors.reset}`)

    console.log(`${colors.brightGreen}          NOTES API SERVER${colors.reset}`)

    console.log(`${colors.brightCyan}========================================${colors.reset}`)

    console.log(`${colors.brightWhite}PORT:${colors.reset} ${port}`)

    console.log(`${colors.brightWhite}URL:${colors.reset} http://localhost:${port}`)

    console.log(`${colors.brightWhite}HEALTH:${colors.reset} http://localhost:${port}/api/health`)

    console.log(`${colors.brightWhite}API:${colors.reset} http://localhost:${port}/api/notes`)

    console.log(`${colors.brightCyan}========================================${colors.reset}`)

    console.log("")
}
