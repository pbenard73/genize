#!/usr/bin/env node

const path = require("path")
const fs = require("fs")
const _ = require("underscore")
const inquirer = require("inquirer")

const componentTemplate = require("./templates/component")
const hocTemplate = require("./templates/hoc")
const reduxerTemplate = require("./templates/reduxer")

const PIVOT = "/bin/genize"
const COMMANDS_LIST = {
    container: [{ name: "hocName" }, { name: "isClass", type: "confirm", message: "Is React Class ?" }],
    page: [{ name: "hocName" }, { name: "isClass", type: "confirm", message: "Is React Class ?" }],
    window: [{ name: "hocName" }, { name: "isClass", type: "confirm", message: "Is React Class ?" }],
    component: [{ name: "hocName" }, { name: "isClass", type: "confirm", message: "Is React Class ?" }],
    reduxer: [],
    hoc: [],
}

function getCommand() {
    return new Promise((resolve, reject) => {
        const args = process.argv

        let command = null
        let foundPivot = false
        let commandArgs = []
        _.each(args, arg => {
            if (foundPivot === false && arg.indexOf(PIVOT) !== -1) {
                foundPivot = true
            } else if (foundPivot === true && command === null && COMMANDS_LIST[arg] !== undefined) {
                command = arg
            } else if (command !== null) {
                commandArgs.push(arg)
            }
        })

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

        if (command !== null) {
            return returnResult({ command, name: commandArgs.length > 0 ? commandArgs[0] : `New${command}` })
        }

        inquirer
            .prompt([
                { name: "command", type: "list", choices: Object.keys(COMMANDS_LIST), message: "Choose Command" },
                { name: "name", message: "Given Name" },
            ])
            .then(value => {
                return returnResult({ command: value.command,  name: value.name  })
            })
            .catch(error => reject(error))
    })
}

function getRoot() {
    let root = null
    let error = false
    let current = path.resolve(".")

    while (root === null && error === false) {
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

function run() {
    const root = getRoot()

    if (root === null) {
        console.error("No project root found")
        process.exit(1)
    }

    getCommand()
        .then(command => {
            let template = null
            if (["page", "window", "component", "container"].indexOf(command.command) !== -1) {
                template = componentTemplate(command.args)
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
                fs.mkdirSycn(folderPath)
            }

            const filePath = path.join(folderPath, command.args.name + ".js")
		console.log(command.args)

            fs.writeFile(filePath, template, error => {
                if (error) {
                    console.error(error)
                    process.exit(1)
                }
                console.log("File generated successfully !")
                process.exit(0)
            })
        })
        .catch(error => {
            console.log(error)
            process.exit(1)
        })
}

run()