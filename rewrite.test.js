const { match } = require("assert/strict")
const assert = require("assert")
const { describe, it } = require("node:test")
const { makePaths, select, flatten, findOne, findMany } = require("./rewrite")
const { deepEqual, equal } = require("assert")
const { log, itLog } = require("./_log")

let elm = {
    "type": "Module",
    "span": {
        "start": 3,
        "end": 71,
        "ctxt": 0
    },
    "body": [
        {
            "type": "VariableDeclaration",
            "span": {
                "start": 3,
                "end": 25,
                "ctxt": 0
            },
            "kind": "const",
            "declare": false,
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "span": {
                        "start": 9,
                        "end": 25,
                        "ctxt": 0
                    },
                    "id": {
                        "type": "Identifier",
                        "span": {
                            "start": 9,
                            "end": 16,
                            "ctxt": 1
                        },
                        "value": "version",
                        "optional": false,
                        "typeAnnotation": null
                    },
                    "init": {
                        "type": "StringLiteral",
                        "span": {
                            "start": 19,
                            "end": 25,
                            "ctxt": 0
                        },
                        "value": "hola",
                        "raw": "\"hola\""
                    },
                    "definite": false
                }
            ]
        },
        {
            "type": "VariableDeclaration",
            "span": {
                "start": 27,
                "end": 42,
                "ctxt": 0
            },
            "kind": "const",
            "declare": false,
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "span": {
                        "start": 33,
                        "end": 42,
                        "ctxt": 0
                    },
                    "id": {
                        "type": "Identifier",
                        "span": {
                            "start": 33,
                            "end": 35,
                            "ctxt": 1
                        },
                        "value": "hi",
                        "optional": false,
                        "typeAnnotation": null
                    },
                    "init": {
                        "type": "BooleanLiteral",
                        "span": {
                            "start": 38,
                            "end": 42,
                            "ctxt": 0
                        },
                        "value": true
                    },
                    "definite": false
                }
            ]
        },
        {
            "type": "VariableDeclaration",
            "span": {
                "start": 44,
                "end": 71,
                "ctxt": 0
            },
            "kind": "const",
            "declare": false,
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "span": {
                        "start": 50,
                        "end": 70,
                        "ctxt": 0
                    },
                    "id": {
                        "type": "Identifier",
                        "span": {
                            "start": 50,
                            "end": 53,
                            "ctxt": 1
                        },
                        "value": "BBB",
                        "optional": false,
                        "typeAnnotation": null
                    },
                    "init": {
                        "type": "MemberExpression",
                        "span": {
                            "start": 56,
                            "end": 70,
                            "ctxt": 0
                        },
                        "object": {
                            "type": "MemberExpression",
                            "span": {
                                "start": 56,
                                "end": 67,
                                "ctxt": 0
                            },
                            "object": {
                                "type": "Identifier",
                                "span": {
                                    "start": 56,
                                    "end": 63,
                                    "ctxt": 2
                                },
                                "value": "process",
                                "optional": false
                            },
                            "property": {
                                "type": "Identifier",
                                "span": {
                                    "start": 64,
                                    "end": 67,
                                    "ctxt": 0
                                },
                                "value": "env",
                                "optional": false
                            }
                        },
                        "property": {
                            "type": "Identifier",
                            "span": {
                                "start": 68,
                                "end": 70,
                                "ctxt": 0
                            },
                            "value": "ok",
                            "optional": false
                        }
                    },
                    "definite": false
                }
            ]
        }
    ],
    "interpreter": null
}

describe("Find Paths", () => {
    it("select path", () => {
        const found = select(["body", "1", "declarations", "0"], elm)
        assert(found)
        deepEqual(found, {
            type: 'VariableDeclarator',
            span: { start: 33, end: 42, ctxt: 0 },
            id: {
                type: 'Identifier',
                span: { start: 33, end: 35, ctxt: 1 },
                value: 'hi',
                optional: false,
                typeAnnotation: null
            },
            init: {
                type: 'BooleanLiteral',
                span: { start: 38, end: 42, ctxt: 0 },
                value: true
            },
            definite: false
        })
    })

    it("flatten array", () => {
        deepEqual(Array.from(flatten(elm)).at(5), [['body', '0', 'span', 'start'], 3])
    })

    it("match paths", () => {
        deepEqual(
            Array.from(makePaths(['body', '2', 'declarations', { $all: true }, 'id', 'value'], elm)),
            [
                ['body', '2', 'declarations', '0', 'id', 'value'],
                ['body', '2', 'declarations', 'length', 'id', 'value']
            ]
        )
        deepEqual(
            Array.from(makePaths(['body', { $all: true }, 'declarations', '0', 'id', 'value'], elm)),
            [
                ['body', '0', 'declarations', '0', 'id', 'value'],
                ['body', '1', 'declarations', '0', 'id', 'value'],
                ['body', '2', 'declarations', '0', 'id', 'value'],
                ['body', 'length', 'declarations', '0', 'id', 'value']
            ]
        )
        deepEqual(
            Array.from(makePaths(['body', { $all: true }, 'declarations', { $all: true }, 'id', 'value'], elm)),
            [
                ['body', '0', 'declarations', '0', 'id', 'value'],
                ['body', '0', 'declarations', 'length', 'id', 'value'],
                ['body', '1', 'declarations', '0', 'id', 'value'],
                ['body', '1', 'declarations', 'length', 'id', 'value'],
                ['body', '2', 'declarations', '0', 'id', 'value'],
                ['body', '2', 'declarations', 'length', 'id', 'value']
            ]
        )
        deepEqual(
            Array.from(makePaths(['body', '0', 'declarations', { $all: true }, 'id', 'value'], elm)),
            [
                ['body', '0', 'declarations', '0', 'id', 'value'],
                ['body', '0', 'declarations', 'length', 'id', 'value']
            ]
        )
        deepEqual(
            Array.from(makePaths(['body', '0', 'declarations', { $in: ["0", "1"] }, 'id', 'value'], elm)),
            [
                ['body', '0', 'declarations', '0', 'id', 'value'],
                ['body', '0', 'declarations', '1', 'id', 'value']
            ]
        )
        deepEqual(
            Array.from(makePaths(['body', { $all: true }, 'declarations', { $in: ["0", "1"] }, 'id', 'value'], elm)),
            [
                ['body', '0', 'declarations', '0', 'id', 'value'],
                ['body', '0', 'declarations', '1', 'id', 'value'],
                ['body', '1', 'declarations', '0', 'id', 'value'],
                ['body', '1', 'declarations', '1', 'id', 'value'],
                ['body', '2', 'declarations', '0', 'id', 'value'],
                ['body', '2', 'declarations', '1', 'id', 'value'],
                ['body', 'length', 'declarations', '0', 'id', 'value'],
                ['body', 'length', 'declarations', '1', 'id', 'value']
            ]
        )
        deepEqual(
            Array.from(makePaths(['body', { $in: ["0", "1"] }, 'declarations', { $in: ["0", "1"] }, 'id', 'value'], elm)),
            [
                ['body', '0', 'declarations', '0', 'id', 'value'],
                ['body', '0', 'declarations', '1', 'id', 'value'],
                ['body', '1', 'declarations', '0', 'id', 'value'],
                ['body', '1', 'declarations', '1', 'id', 'value']
            ]
        )
        deepEqual(
            Array.from(makePaths(['body', { $in: ["0", "1"] }, 'declarations', { $in: ["0", "1"] }, { $all: true }, 'value'], elm)),
            [
                ['body', '0', 'declarations', '0', 'type', 'value'],
                ['body', '0', 'declarations', '0', 'span', 'value'],
                ['body', '0', 'declarations', '0', 'id', 'value'],
                ['body', '0', 'declarations', '0', 'init', 'value'],
                ['body', '0', 'declarations', '0', 'definite', 'value'],
                ['body', '1', 'declarations', '0', 'type', 'value'],
                ['body', '1', 'declarations', '0', 'span', 'value'],
                ['body', '1', 'declarations', '0', 'id', 'value'],
                ['body', '1', 'declarations', '0', 'init', 'value'],
                ['body', '1', 'declarations', '0', 'definite', 'value']
            ]
        )
    })
    it("find one", () => {
        equal(findOne(['body', { $in: ["0", "1"] }, 'declarations', { $in: ["0", "1"] }, { $all: true }, 'value'], elm), "version")
    })
    it("find many", () => {
        deepEqual([...findMany(['body', { $in: ["0", "1"] }, 'declarations', { $in: ["0", "1"] }, { $all: true }, 'value'], elm)], ['version', 'hola', 'hi', true])
    })
    itLog("find one on child", () => {
        deepEqual(
            [...makePaths(
                ["child", { $eq: { paths: ["version"], value: "Ok" } }],
                { child: { version: "Ok", name: "Ok" } }
            )],
            [['child']]
        )

        deepEqual(
            [...makePaths(
                ["children", { $all: 1 }, { $eq: { paths: ["version"], value: "1" } }],
                {
                    children: {
                        a: { version: "1", name: "Item 1" },
                        b: { version: "2", name: "Item 2" },
                        c: { version: "1", name: "Item 3" },
                        d: { version: "3", name: "Item 4" }
                    }
                }
            )],
            [['children', 'a'], ['children', 'c']]
        )

        deepEqual(
            [...makePaths(
                ["children", { $all: 1 }, { $eq: { paths: ["version"], value: "1" } }, "version"],
                {
                    children: {
                        a: { version: "1", name: "Item 1" },
                        b: { version: "2", name: "Item 2" },
                        c: { version: "1", name: "Item 3" },
                        d: { version: "3", name: "Item 4" }
                    }
                }
            )],
            [
                ["children", "a", "version"],
                ["children", "c", "version"],
            ]
        )
    })

    itLog("find init by identifier", () => {
        deepEqual(
            [...findMany(["body", { $all: 1 }, "declarations", { $all: 1 }, { $eq: { paths: ["id", "value"], value: "version" } }, "init"], elm)],
            [
                {
                    type: 'StringLiteral',
                    span: { start: 19, end: 25, ctxt: 0 },
                    value: 'hola',
                    raw: '"hola"'
                }
            ]
        )
    })
})
