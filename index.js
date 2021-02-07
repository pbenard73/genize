#!/usr/bin/env node

const path = require("path")
const fs = require("fs")
const _ = require("underscore")
const inquirer = require("inquirer")

const componentTemplate = require("./templates/component")
const hocTemplate = require("./templates/hoc")
const reduxerTemplate = require("./templates/reduxer")
const appTemplate = require("./templates/app")
const spawn = require("child_process").spawn

const PIVOT = "/bin/genize"
const COMMANDS_LIST = {
    create: [],
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
                return returnResult({ command: value.command, name: value.name })
            })
            .catch(error => reject(error))
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

function createApp(data) {
    const success = () => {
        console.log("Cool !")
        process.exit(0)
    }

    const error = () => {
        console.error("Error during App creation")
        process.exit(1)
    }

    const name = data.args.name
    runSpawn("npx", ["--registry", "https://registry.npmjs.org", "create-react-app@latest", "--use-npm", name])
        .then(() => {
            runSpawn("npm", [
                "--registry",
                "https://registry.npmjs.org",
                "--prefix",
                "./" + name,
                "install",
                "reactizy",
                "react-dom",
                "--save",
            ])
                .then(() => {
                    createAppFiles(name)
                        .then(success)
                        .catch(e => console.log(e))
                        .catch(error)
                })
                .catch(e => console.log(e))
                .catch(error)
        })
        .catch(e => console.log(e))
        .catch(error)
}

function createAppFiles(folder) {
    const root = path.resolve("./" + folder + "/src/")
    return new Promise((resolve, reject) => {
        try {
            fs.mkdirSync(root + "/hocs")
            fs.mkdirSync(root + "/reduxers")
            fs.mkdirSync(root + "/components")
            fs.mkdirSync(root + "/containers")
            fs.mkdirSync(root + "/pages")
            fs.mkdirSync(root + "/windows")

            const hoc = hocTemplate({ name: "hoc", reduxers: "main" })
            const reduxer = reduxerTemplate({ name: "main" })
            const component = componentTemplate({ name: "MyComponent", hocName: "hoc", isClass: false })

            fs.writeFileSync(root + "/components/MyComponent.js", component)
            fs.writeFileSync(root + "/hocs/hoc.js", hoc)
            fs.writeFileSync(root + "/reduxers/main.js", reduxer)
            fs.writeFileSync(root + "/App.js", appTemplate)
            resolve(true)
        } catch (e) {
            console.log(e)
            reject(e)
        }
    })
}

function run() {
    getCommand()
        .then(command => {
            if (command.command === "create") {
                return createApp(command)
            }

            const root = getRoot()

            if (root === null) {
                console.error("No project root found")
                process.exit(1)
            }

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
                fs.mkdirSync(folderPath)
            }

            const filePath = path.join(folderPath, command.args.name + ".js")

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
