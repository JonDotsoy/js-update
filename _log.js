const test = require("node:test")
const { createWriteStream } = require("fs")
const { inspect } = require("util")

const ws = createWriteStream(".log", "utf-8")

const log = exports.log = (...args) => {
    const err = new Error()
    Error.captureStackTrace(err, log)
    const location = err.stack ? err.stack.match(/at (.*)\n/)?.at(0) : undefined
    const stack = err.stack ? err.stack.match(/^.*\n([\W\w]*)/).at(1) : undefined

    ws.write(`LOG\n`)
    ws.write(`TimeStamp: ${new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'full' })}\n`)
    ws.write(`Location: ${location}\n`)
    // ws.write(`Stack:\n`)
    // ws.write(`${stack}\n`)
    ws.write(`\n`)
    for (const arg of args) {
        ws.write(`${inspect(arg, {})}\n`)
    }
    ws.write(`\n`)
    ws.write(`\n`)
}

const itLog = exports.itLog = (...args) => {
    test.it(...args.map(e => typeof e === "function" ? (...a) => {
        try {
            return e(...a)
        } catch (ex) {
            log(ex)
            throw ex;
        }
    } : e))
}
