module.exports = (es6 = false) => {
    if (es6 === false) {
    return `const createError = require("http-errors")
const fs = require("fs")
const path = require('path')
const express = require("express")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const bodyParser = require("body-parser")
const cors = require("cors")
const session = require("express-session")

const mainRouter = require("./routes/main")

const app = express()

app.use(cors({ credentials: true, origin: true }))
app.options("*", cors({ credentials: true, origin: true }))
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'dev') {
    app.use(logger("dev"))
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public_assets")))
app.use(express.static(path.join(__dirname, "build")))

app.use(
    session({
        secret: 'my super secret key',
        resave: false,
        rolling: true,
        saveUninitialized: true,
        cookie: { secure: false },
    })
)

app.use("/api", mainRouter)

app.use((req, res, next) => {
    fs.readFile(\`./build/index.html\`, "utf8", (error, data) => {
        if (!error) {
            res.send(data)
        } else {
            console.log(error)
        }
    })
})

app.use((err, req, res, next) => {
    console.log(err)
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    res.status(err.status || 500)
    res.render("error")
})

module.exports = app`
    }

    return `import createError from "http-errors"
import fs from "fs"
import path from "path"
import express from "express"
import cookieParser from "cookie-parser"
import logger from "morgan"
import bodyParser from "body-parser"
import cors from "cors"
import session from "express-session"

import mainRouter from "./routes/main.js"

const __dirname = path.resolve();
const app = express()

app.use(cors({ credentials: true, origin: true }))
app.options("*", cors({ credentials: true, origin: true }))
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'dev') {
    app.use(logger("dev"))
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(".", "public_assets")))
app.use(express.static(path.join(".", "build")))

app.use(
    session({
        secret: 'my super secret key',
        resave: false,
        rolling: true,
        saveUninitialized: true,
        cookie: { secure: false },
    })
)

app.use("/api", mainRouter)

app.use((req, res, next) => {
    fs.readFile(\`./build/index.html\`, "utf8", (error, data) => {
        if (!error) {
            res.send(data)
        } else {
            console.log(error)
        }
    })
})

app.use((err, req, res, next) => {
    console.log(err)
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    res.status(err.status || 500)
    res.render("error")
})

export default app`

}
