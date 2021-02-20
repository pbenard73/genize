const fs = require("fs")
const path = require("path")
const inquirer = require("inquirer")
const componentTemplate = require("./templates/component")
const hocTemplate = require("./templates/hoc")
const hocApi = require("./templates/hocApi")
const reduxerTemplate = require("./templates/reduxer")
const appTemplate = require("./templates/app")
const appRouter = require("./templates/app_router")
const apiComponent = require("./templates/compo_api")
const apiMain = require("./templates/apiMain")
const apiTemplate = require("./templates/api")
const pageHome = require("./templates/page_home")
const pageOther = require("./templates/page_other")
const envTemplate = require("./templates/setenv")
const envsTemplate = require("./templates/envs")
const routeTemplate = require("./templates/route")
const serverTemplate = require("./templates/server")
const wwwTemplate = require("./templates/www")

function mkdir(folderPath) {fs.mkdirSync(folderPath)}
function write(filePath, content) {fs.writeFileSync(filePath, content)}

function getExtraQuestions(options) {
    return new Promise((resolve, reject) => {
        if (options.server === true) {
            return inquirer
                .prompt([{ name: "js", type: "list", choices: ["common", "es6"], message: "Javascript Version" }])
                .then(value => resolve(value))
                .catch(error => reject(error))
        }

        resolve({})
    })
}

function createAppFiles(folder, options = {}) {
    const base = path.resolve("./" + folder + "/")
    const root = path.resolve("./" + folder + "/src/")
    return new Promise((resolve, reject) => {
        try {
            mkdir(root + "/apis")
            mkdir(root + "/hocs")
            mkdir(root + "/reduxers")
            mkdir(root + "/components")
            mkdir(root + "/containers")
            mkdir(root + "/pages")
            mkdir(root + "/windows")

            if (options.server === true) {
                mkdir(base + "/public_assets")
                mkdir(base + "/routes")
                mkdir(base + "/scripts")
                mkdir(base + "/bin")
            }

            const hoc = hocTemplate({ name: "hoc", reduxers: "main" })
            const reduxer = reduxerTemplate({ name: "main" })
            const component = componentTemplate({ name: "MyComponent", hocName: "hoc", isClass: false })

            fs.writeFileSync(root + "/reduxers/main.js", reduxer)

            const writeApp = givenComponent => {
                write(root + "/components/MyComponent.js", givenComponent)
                if (options.withRouter !== true) {
                    write(root + "/App.js", appTemplate)
                } else {
                    write(root + "/App.js", appRouter)
		    write(root + "/pages/Home.js", pageHome)
		    write(root + "/pages/Other.js", pageOther)
                }
            }

            if (options.server !== true) {
                writeApp(component)

                write(root + "/hocs/hoc.js", hoc)
            } else {
                const es6 = options.js === "es6"
                writeApp(apiComponent())

                write(root + "/hocs/hoc.js", hocApi())
                write(root + "/apis/api.js", apiMain())

                write(`${base}/bin/www${es6 === true ? ".js" : ""}`, wwwTemplate(es6 === true))
                write(base + "/app.js", serverTemplate(es6 === true))
                write(base + "/routes/main.js", routeTemplate(es6 === true))
                write(base + "/scripts/setEnv.js", envTemplate(es6 === true))
                write(`${base}/env.dev${es6 === true ? ".js" : ""}`, envsTemplate(es6 === true, true))
                write(`${base}/env.prod${es6 === true ? ".js" : ""}`, envsTemplate(es6 === true))
                write(root + "/env.js", "")

                let packageFile = fs.readFileSync(base + "/package.json")
                packageFile = JSON.parse(packageFile)
                packageFile.scripts["start"] = `node ./bin/www${es6 === true ? ".js" : ""}`
                packageFile.scripts["start_front"] = `node ./scripts/setEnv.js dev; react-scripts start`
                packageFile.scripts["build"] = "node ./scripts/setEnv.js prod; react-scripts build"

                if (options.js === "es6") {
                    packageFile["type"] = "module"
                }

                write(base + "/package.json", JSON.stringify(packageFile, null, 2))
            }

            resolve(true)
        } catch (e) {
            console.log(e)
            reject(e)
        }
    })
}

module.exports = function createApp(runSpawn, data) {
    const success = () => {
        console.log("Cool !")
        process.exit(0)
    }

    const error = () => {
        console.error("Error during App creation")
        process.exit(1)
    }

    let modules = ["reactizy", "react-dom"]

    if (data.args.withRouter === true) {
        modules.push("react-router-dom")
    }

    if (data.args.server === true) {
        modules = [
            ...modules,
            "body-parser",
            "cookie-parser",
            "cors",
            "debug",
            "express",
            "express-session",
            "http-errors",
            "morgan",
        ]
    }

    const name = data.args.name
    getExtraQuestions(data.args)
        .then(result => {
            const options = { ...data.args, ...result }
            runSpawn("npx", ["--registry", "https://registry.npmjs.org", "create-react-app@latest", "--use-npm", name]).then(
                () => {
                    runSpawn("npm", [
                        "--registry",
                        "https://registry.npmjs.org",
                        "--prefix",
                        "./" + name,
                        "install",
                        ...modules,
                        "--save",
                    ])
                        .then(() => {
                            createAppFiles(name, options)
                                .then(success)
                                .catch(e => console.log(e))
                                .catch(error)
                        })
                        .catch(e => console.log(e))
                        .catch(error)
                }
            )
        })
        .catch(e => console.log(e))
        .catch(error)
        .catch(e => console.log(e))
}
