#!/usr/bin/env node
import fs from "node:fs"
import {resolve} from "node:path";
import { fileURLToPath } from 'node:url';
import {spawn} from "node:child_process"

const APP_NAME = "nodemoon"
const JS_EXTENSION = "js"

const filename = process.argv[2]

if (filename === undefined) {
    console.error("You must specify a file to be watched")
    process.exit(1)
}

const filenameArr = filename.split(".")
const fileExtension = filenameArr[filenameArr.length - 1]

if (fileExtension !== JS_EXTENSION) {
    console.error(`${APP_NAME} only watches ${JS_EXTENSION} files`)
    process.exit(1)
}

const cwd = process.cwd()
const path = resolve(cwd, filename)

const __filename = fileURLToPath(import.meta.url);
if (path === __filename) {
    console.error("You can't watch the nodemoon ^-^")
    process.exit(1)
}

fs.access(path, fs.constants.R_OK, (err) => {
    if (err) {
        console.error(`Can't read file:${filename}`)
        process.exit(1)
    }

    console.log(`${APP_NAME} will start watching your file`)
    let childProcess = run(path)
    let startWatchingTime = new Date()

    fs.watch(path, null, (event, filename) => {
        const timeDifference = new Date() - startWatchingTime
        if (timeDifference > 500) {
            childProcess.kill()
            console.log(`${filename} has a new ${event} event`)
            childProcess = run(path)
            startWatchingTime = new Date()
        }
    })
})


function run(filename) {
    const node = spawn('node', [filename])
    node.stdout.pipe(process.stdout)
    node.stderr.pipe(process.stderr)
    return node
}
