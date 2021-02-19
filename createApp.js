const fs = require("fs")
const path = require("path")
const inquirer = require("inquirer")
const componentTemplate = require("./templates/component")
const hocTemplate = require("./templates/hoc")
const hocApi = require("./templates/hocApi")
const reduxerTemplate = require("./templates/reduxer")
const appTemplate = require("./templates/app")
const apiComponent = require("./templates/compo_api")
const apiMain = require("./templates/apiMain")
const apiTemplate = require("./templates/api")
const envTemplate = require("./templates/setenv")
const envsTemplate = require("./templates/envs")
const routeTemplate = require("./templates/route")
const serverTemplate = require("./templates/server")
const wwwTemplate = require("./templates/www")

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
            fs.mkdirSync(root + "/apis")
            fs.mkdirSync(root + "/hocs")
            fs.mkdirSync(root + "/reduxers")
            fs.mkdirSync(root + "/components")
            fs.mkdirSync(root + "/containers")
            fs.mkdirSync(root + "/pages")
            fs.mkdirSync(root + "/windows")

            if (options.server === true) {
                fs.mkdirSync(base + "/public_assets")
                fs.mkdirSync(base + "/routes")
                fs.mkdirSync(base + "/scripts")
                fs.mkdirSync(base + "/bin")
            }

            const hoc = hocTemplate({ name: "hoc", reduxers: "main" })
            const reduxer = reduxerTemplate({ name: "main" })
            const component = componentTemplate({ name: "MyComponent", hocName: "hoc", isClass: false })

            fs.writeFileSync(root + "/reduxers/main.js", reduxer)
            fs.writeFileSync(root + "/App.js", appTemplate)

            if (options.server !== true) {
                fs.writeFileSync(root + "/components/MyComponent.js", component)
                fs.writeFileSync(root + "/hocs/hoc.js", hoc)
            } else {
                const es6 = options.js === "es6"

                fs.writeFileSync(root + "/components/MyComponent.js", apiComponent())
                fs.writeFileSync(root + "/hocs/hoc.js", hocApi())
                fs.writeFileSync(root + "/apis/api.js", apiMain())

                fs.writeFileSync(`${base}/bin/www${es6 === true ? ".js" : ""}`, wwwTemplate(es6 === true))
                fs.writeFileSync(base + "/app.js", serverTemplate(es6 === true))
                fs.writeFileSync(base + "/routes/main.js", routeTemplate(es6 === true))
                fs.writeFileSync(base + "/scripts/setEnv.js", envTemplate(es6 === true))
                fs.writeFileSync(`${base}/env.dev${es6 === true ? ".js" : ""}`, envsTemplate(es6 === true, true))
                fs.writeFileSync(`${base}/env.prod${es6 === true ? ".js" : ""}`, envsTemplate(es6 === true))
                fs.writeFileSync(root + "/env.js", "")

                let packageFile = fs.readFileSync(base + "/package.json")
                packageFile = JSON.parse(packageFile)
                packageFile.scripts["start"] = `node ./bin/www${es6 === true ? ".js" : ""}`
                packageFile.scripts["start_front"] = `node ./scripts/setEnv.js dev; react-scripts start`
                packageFile.scripts["build"] = "node ./scripts/setEnv.js prod; react-scripts build"

                if (options.js === "es6") {
                    packageFile["type"] = "module"
                }

                fs.writeFileSync(base + "/package.json", JSON.stringify(packageFile, null, 2))
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
