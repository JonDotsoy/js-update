const swc = require("@swc/core")
const { createWriteStream } = require("fs")
const { writeFile } = require("fs/promises")
const { inspect } = require("util")
const { log } = require("./_log")


/**
 * @param {(string|number)[]} paths 
 * @param {object} elm
 * @return {any}
 */
const select = exports.select = (paths, elm) => {
    /**
     * @param {string} path 
     * @param {object} elm 
     * @return {any}
     */
    const selectChild = (path, elm) => {
        if (elm !== undefined && elm !== null) {
            // log(path, Object.getOwnPropertyDescriptor(elm, path))
            return Object.getOwnPropertyDescriptor(elm, path)?.value
        }
    }

    let child = elm

    for (const field of paths) {
        child = selectChild(field, child)
    }

    return child
}

/**
 * @param {(string|{$all:true}|{$in:string[]})[]} paths
 * @param {any} elm
 * @param {string[]} parent
 * @param {number} skipFind
 * @returns {Iterable<string[]>}
 */
const makePaths = exports.makePaths = function* (paths, elm, parent = [], skipFind = 0) {
    for (const configurablePath of paths.slice(skipFind)) {
        // log({ configurablePath }, { pathsIteration }, { child: _selectPure(pathsIteration, elm) })
        // console.log({ pathsIteration, configurablePath, child: _selectPure(pathsIteration, elm) })
        if (typeof configurablePath === "object" && configurablePath !== null) {
            const configurablePathEntries = Object.entries(configurablePath)
            if (configurablePathEntries.length !== 1) throw new TypeError("Expected only one path configuration")
            const [[action, options]] = configurablePathEntries

            if (action === "$in" && Array.isArray(options)) {
                for (const option in options) {
                    const newPath = [...parent, option, ...paths.slice(parent.length + 1)]
                    yield* makePaths(newPath, elm, [...parent, option], parent.length + 1)
                }
                return
            }
            if (action === "$all") {
                const child = select(parent, elm);
                if (child !== undefined && child !== null) {
                    for (const name of Object.getOwnPropertyNames(child)) {
                        const newPath = [...parent, name, ...paths.slice(parent.length + 1)]
                        yield* makePaths(newPath, elm, [...parent, name], parent.length + 1)
                    }
                }
                return
            }
            if (action == "$eq") {
                const { paths: operationPaths, value: operationValue } = options
                const child = select(parent, elm)
                for (const path of makePaths(operationPaths, child)) {
                    let relativePath = select(path, child)
                    if (relativePath === operationValue) {
                        const newPath = [...parent, ...paths.slice(parent.length + 1)]
                        yield* makePaths(newPath, elm, parent, parent.length)
                    }
                }
                return
            }
            throw new TypeError(`Unexpected configurable Path ${JSON.stringify(configurablePath)}`)
        }
        parent.push(configurablePath)
    }

    yield parent
}

/**
 * @param {(string|Record<string,any>)[]} pathsConfigurable 
 * @param {object} elm
 * @return {any}
 */
const findOne = exports.findOne = (pathsConfigurable, elm) => {
    for (const paths of makePaths(pathsConfigurable, elm)) {
        let found = select(paths, elm)
        if (found) return found
    }
}

/**
 * @param {(string|Record<string,any>)[]} pathsConfigurable 
 * @param {object} elm
 * @return {Iterable<any>}
 */
const findMany = exports.findMany = function* (pathsConfigurable, elm) {
    for (const paths of makePaths(pathsConfigurable, elm)) {
        let found = select(paths, elm)
        if (found) yield found
    }
}

/**
 * @param {any} elm
 * @param {string[]} parent
 * @return {[string[],any]}
 */
const flatten = exports.flatten = function* (elm, parent = []) {
    if (Array.isArray(elm)) {
        for (const index in elm) {
            yield* flatten(elm[index], [...parent, index])
        }
        return
    }
    if (typeof elm === "object" && elm !== null) {
        for (const name of Object.getOwnPropertyNames(elm)) {
            yield* flatten(elm[name], [...parent, name])
        }
        return
    }

    yield [parent, elm]
}
