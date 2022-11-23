#!/usr/bin/env node

const { flatten, findOne, findMany } = require("./rewrite");
const { parse } = require("@swc/core");
const { argv, cwd } = require("process");
const { readFile } = require("fs/promises");
const { readFileSync, writeFileSync } = require("fs");
const { version } = require("./version")
const util = require("util")

const inspect = async (fileToInspect, match = '.') => {
    const fileLocation = new URL(fileToInspect, new URL(`${cwd()}/`, 'file://'));
    const src = readFileSync(fileLocation)
    const script = await parse(src.toString('utf-8'), {
        target: 'es2022',
        syntax: 'typescript',
        isModule: true,
    });

    for (const [k, v] of flatten(script)) {
        const line = `${JSON.stringify(k)}=${v}`;
        if (line.match(match)) {
            console.log(`${line}`)
        }
    }
}

const test = async (fileToInspect, relativePathStr, replace) => {
    const fileLocation = new URL(fileToInspect, new URL(`${cwd()}/`, 'file://'));
    const relativePath = JSON.parse(relativePathStr)
    const src = readFileSync(fileLocation)
    const script = await parse(src.toString('utf-8'), {
        target: 'es2022',
        syntax: 'typescript',
        isModule: true,
    });

    const getChunk = (elm) => {
        const { start, end } = elm.span;

        const chunk = src.subarray(start - 1, end - 1)
        return chunk;
    }

    const match = [...findMany(relativePath, script)];
    for (const e of match) {
        console.log(e)
        console.log()
        console.log(getChunk(e).toString())
    }
}

const replace = async (fileToInspect, relativePathStr, newValue) => {
    const fileLocation = new URL(fileToInspect, new URL(`${cwd()}/`, 'file://'));
    const relativePath = JSON.parse(relativePathStr)
    const src = readFileSync(fileLocation)
    const script = await parse(src.toString('utf-8'), {
        target: 'es2022',
        syntax: 'typescript',
        isModule: true,
    });

    const replaceChunk = (elm, newValue) => {
        const { start, end } = elm.span;

        const beforeChunk = src.subarray(0, start - 1)
        const newChunk = Buffer.from(newValue)
        const afterChunk = src.subarray(end - 1)

        writeFileSync(fileLocation, Buffer.from([...beforeChunk, ...newChunk, ...afterChunk]).toString())
    }

    const match = [...findMany(relativePath, script)];
    for (const e of match) {
        replaceChunk(e, newValue)
    }
}

const versionHandler = () => {
    console.log(`JS-Rewrite ${version}`)
}

const main = async () => {
    const [, , command, ...restArgs] = argv;

    switch (command) {
        case 'i':
        case "inspect": return inspect(...restArgs)
        case 't':
        case "test": return test(...restArgs)
        case 'r':
        case "replace": return replace(...restArgs)
        default: versionHandler()
    }
}

main().catch(console.error)
