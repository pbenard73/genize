module.exports = (es6 = false, ssr = false) => {
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
${ssr === true ? `const { spawn } = require("child_process")
` : ''}
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

${ssr === true ? `const indexUrl = (req, res, next) => {
        fs.readFile(\`./build/index.html\`, "utf8", (error, index) => {
                if (error) {
                        console.log(error);
                        return res.status(500).send();
                }

                const ssr = path.resolve(path.join(__dirname, "ssr.js"));
                const ssrRenderer = spawn("node", [ssr, '-u', req.url]);

                let content = null;

                ssrRenderer.on("message", (data) => {
                        if (data.content !== undefined) {
                        }
                });

                ssrRenderer.stdout.on("data", (data) => {
                        index = index.replace(
                                '<div id="root"></div>',
                                \`<div id="root">$\{data.toString()}</div>\`
                        );
                });

                ssrRenderer.stderr.on("data", (data) => {
                        console.error(data.toString());
                });

                ssrRenderer.on("data", (data) => {
                        console.log("hey");
                        content = data.toString();
                });

                ssrRenderer.on("message", (data) => {
                        console.log(data);
                        if (data.content !== undefined) {
                                content = data.content;
                        }
                });

                ssrRenderer.on("exit", () => {
                        res.send(index);
                });
        });
};

app.get("/", indexUrl);
` : ''}

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

${ssr === true ? `app.use(indexUrl);
` : `app.use((req, res, next) => {
    fs.readFile(\`./build/index.html\`, "utf8", (error, data) => {
        if (!error) {
            res.send(data)
        } else {
            console.log(error)
        }
    })
})`}

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
${ssr === true ? `import { spawn } from "child_process"
` : ''}

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

${ssr === true ? `const indexUrl = (req, res, next) => {
        fs.readFile(\`./build/index.html\`, "utf8", (error, index) => {
                if (error) {
                        console.log(error);
                        return res.status(500).send();
                }

                const ssr = path.resolve(path.join(__dirname, "ssr.js"));
                const ssrRenderer = spawn("node", [ssr]);

                let content = null;

                ssrRenderer.on("message", (data) => {
                        if (data.content !== undefined) {
                        }
                });

                ssrRenderer.stdout.on("data", (data) => {
                        index = index.replace(
                                '<div id="root"></div>',
                                \`<div id="root">$\{data.toString()}</div>\`
                        );
                });

                ssrRenderer.stderr.on("data", (data) => {
                        console.error(data.toString());
                });

                ssrRenderer.on("data", (data) => {
                        console.log("hey");
                        content = data.toString();
                });

                ssrRenderer.on("message", (data) => {
                        console.log(data);
                        if (data.content !== undefined) {
                                content = data.content;
                        }
                });

                ssrRenderer.on("exit", () => {
                        res.send(index);
                });
        });
};

app.get("/", indexUrl);
` : ''}


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

${ssr === true ? `app.use(indexUrl);
` : `app.use((req, res, next) => {
    fs.readFile(\`./build/index.html\`, "utf8", (error, data) => {
        if (!error) {
            res.send(data)
        } else {
            console.log(error)
        }
    })
})`}

app.use((err, req, res, next) => {
    console.log(err)
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    res.status(err.status || 500)
    res.render("error")
})

export default app`

}
