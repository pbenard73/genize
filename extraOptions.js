const fs = require("fs")
const path = require("path")
const inquirer = require("inquirer")
const _ = require("underscore")
const colors = require("colors/safe")

function getFlatTree(root, innerRoot) {
    let data = []

    let files = fs.readdirSync(innerRoot)

    _.each(files, file => {
        const fullFile = path.join(innerRoot, file)
        if (fs.statSync(fullFile).isDirectory() === true) {
            data = [...data, ...getFlatTree(root, fullFile)]

            return
        }

        if (path.extname(file) === ".js") {
            data.push(fullFile.replace(root, ""))
        }
    })

    return data
}

function unStackPromise(pool, index, resolve) {
    if (index > pool.length - 1) {
        return resolve()
    }

    pool[index]()
        .catch(e => console.log(e))
        .finally(() => unStackPromise(pool, index + 1, resolve))
}

function unStack(pool) {
    return new Promise((resolve, reject) => {
        unStackPromise(pool, 0, resolve)
    })
}

function pathDiff(root, origin, target) {
    let common = []
    let relativePath = null
    try {
        let origins = origin.replace(root, "").split("/")
        let targets = target.replace(root, "").split("/")
        let stop = false

        _.each(targets, (element, i) => {
            if (stop !== true) {
                if (i < origins.length && element === origins[i]) {
                    common.push(element)
                } else {
                    stop = true
                }
            }
        })

        origins.splice(0, common.length)

        let prepend = new Array(targets.length - common.length - 1).fill("..")

        relativePath = [".", ...prepend, ...origins].join("/")
    } catch (e) {
        console.log(e)
    }

    return relativePath
}

module.exports = (root, file, name, options) => {
    console.log(options)
    return new Promise((resolve, reject) => {
        let promises = []

        if (options.import !== undefined) {
            promises.push(
                () =>
                    new Promise((resolve, reject) => {
                        let prompters = getFlatTree(root, root)

                        inquirer
                            .prompt([
                                {
                                    type: "checkbox",
                                    name: "targets",
                                    choices: prompters,
                                    message: "Inside which files new Files must be imported ?",
                                },
                            ])
                            .then(results => {
                                _.each(results.targets, target => {
                                    const diff = pathDiff(root, file, target)

                                    if (diff === null) {
                                        return
                                    }

                                    try {
                                        const filepath = path.join(root, target)
                                        const toAdd = `import ${name} from "${diff}"`

                                        let content = fs.readFileSync(filepath, "utf8")
                                        content = `${toAdd}
${content}`

                                        fs.writeFileSync(filepath, content)

                                        console.log(`File '${colors.cyan(target)}' updated !`)
                                    } catch (e) {
                                        console.log(e)
                                    }
                                })

                                resolve(true)
                            })
                            .catch(error => resolve(true))
                    })
            )
        }

        unStack(promises)
            .then(() => resolve())
            .catch(error => reject(error))
    })
}
