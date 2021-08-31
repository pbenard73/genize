#!/usr/bin/env node

const path = require("path")
const fs = require("fs")
const _ = require("underscore")
const inquirer = require("inquirer")
const { program } = require("commander")
const colors = require('colors/safe');

const createApp = require("./createApp")
const extraOptions = require('./extraOptions')

const componentTemplate = require("./templates/component")
const hocTemplate = require("./templates/hoc")
const reduxerTemplate = require("./templates/reduxer")
const apiTemplate = require("./templates/api")
const spawn = require("child_process").spawn

const COMMANDS_LIST = {
    create: [
        { name: "withRouter", type: "confirm", message: "Use React Router ?" },
        { name: "server", type: "confirm", message: "Create Express Server ?" },
    ],
    api: [],
    container: [{ name: "hocName" }, { name: "isClass", type: "confirm", message: "Is React Class ?" }],
    page: [{ name: "hocName" }, { name: "isClass", type: "confirm", message: "Is React Class ?" }],
    window: [{ name: "hocName" }, { name: "isClass", type: "confirm", message: "Is React Class ?" }],
    component: [{ name: "hocName" }, { name: "isClass", type: "confirm", message: "Is React Class ?" }],
    reduxer: [],
    hoc: [],
}

let options = {}

function getCommand() {
    return new Promise((resolve, reject) => {
        const returnResult = data => {
            const wantedArgs = COMMANDS_LIST[data.command]

            if (wantedArgs.length === 0) {
                return resolve({ command: data.command, args: { name: data.name } })
            }

            inquirer
                .prompt(wantedArgs)
                .then(result => {
                    return resolve({ command: data.command, args: { name: data.name, ...result } })
                })
                .catch(error => reject(error))
        }

        program
            .name('genize')
            .version('0.0.13')
            .usage(`
Examples :
     ${colors.yellow('genize create my-app')}  : Create a Reactizy Boilerplate
     ${colors.yellow('genize component ComponentName')}  : Create new Component
     ${colors.yellow('genize page PageName')}  : Create new Page
     ${colors.yellow('genize window WindowName')}  : Create new Window
     ${colors.yellow('genize reduxer reduxerName')}  : Create new Reactizy reduxer
     ${colors.yellow('genize hoc hocName')}  : Create new Reactizy hoc
            `)
            .arguments("[command] [name]")
            .option("-i, --import", "Import in files after component creation")
            .action((command, name, givenOptions) => {
                options = givenOptions
                if (COMMANDS_LIST[command] !== undefined) {
                    return returnResult({ command, name: name !== undefined ? name : `New${command}` })
                }

                inquirer
                    .prompt([
                        { name: "command", type: "list", choices: Object.keys(COMMANDS_LIST), message: "Choose Command" },
                        { name: "name", message: "Given Name" },
                    ])
                    .then(value => {
                        return returnResult({ command: value.command, name: value.name })
                    })
                    .catch(error => reject(error))
            })
            .parse(process.argv)
    })
}

function getRoot() {
    let root = null
    let error = false
    let current = path.resolve(".")

    while (root === null && error === false && current !== "/") {
        const packageJsonPath = path.join(current, "package.json")
        try {
            if (fs.existsSync(packageJsonPath) === true) {
                root = current
            } else {
                current = path.resolve(current, "../")
            }
        } catch (e) {
            current = null
            error = e
        }
    }

    return current
}

function runSpawn(...args) {
    const log = text => {
        console.log(text.toString("utf8"))
    }

    return new Promise((resolve, reject) => {
        const exec = spawn(...args, { stdio: "inherit" })

        exec.on("data", line => log(line))

        exec.on("error", gerror => {
            console.log(gerror)
        })

        exec.on("close", code => {
            return code === 0 ? resolve() : reject()
        })
    })
}

function run() {
    getCommand()
        .then(command => {
            if (command.command === "create") {
                return createApp(runSpawn, command)
            }

            const root = getRoot()

            if (root === null) {
                console.error("No project root found")
                process.exit(1)
            }

            let template = null
            if (["page", "window", "component", "container"].indexOf(command.command) !== -1) {
                template = componentTemplate(command.args)
            } else if (command.command === "api") {
                template = apiTemplate(command.args)
            } else if (command.command === "reduxer") {
                template = reduxerTemplate(command.args)
            } else if (command.command === "hoc") {
                template = hocTemplate(command.args)
            }

            if (template === null) {
                console.error(new Error(`Template for '${command.command}' was not found`))
                process.exit(1)
            }

            const folderPath = path.join(root, "src", command.command + "s")
            if (fs.existsSync(folderPath) === false) {
                fs.mkdirSync(folderPath)
            }

            const filePath = path.join(folderPath, command.args.name + ".js")

            fs.writeFile(filePath, template, error => {
                if (error) {
                    console.error(error)
                    process.exit(1)
                }

                console.log("✅ File generated successfully !")
                
                extraOptions(path.join(root, 'src'), filePath, command.args.name, options)
                .catch(error => console.log(error))
                .finally(() => process.exit(0))
            })
        })
        .catch(error => {
            console.log(error)
            process.exit(1)
        })
}

run()
