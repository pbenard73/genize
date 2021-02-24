module.exports = `import React from 'react'
import { Command } from 'commander';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter as Router } from 'react-router-dom'
import App from './src/App.js'
import fs from 'fs'
const program = new Command();

program
        .option('-u, --url <url>', 'Request url')
        .parse(process.argv)

const url = program.opts().url

const app = ReactDOMServer.renderToString(<Router location={url}><App /></Router>);

console.log(app)

process.exit(0)`
