module.exports = `const path = require("path");
const nodeExternals = require("webpack-node-externals");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
        entry: "./ssr.dev.js",

        target: "node",
        externals: [nodeExternals()],

        output: {
                path: path.resolve("."),
                filename: "ssr.js",
        },
        plugins: [new MiniCssExtractPlugin()],
        module: {
                rules: [
                        {
                                test: /\.js$/,
                                use: "babel-loader",
                        },
                        {
                                test: /\.css$/i,
                                use: [
                                        MiniCssExtractPlugin.loader,
                                        "css-loader",
                                ],
                        },
                        {
                                test: /\.svg$/,
                                use: [
                                        {
                                                loader: "svg-url-loader",
                                                options: {
                                                        limit: 10000,
                                                },
                                        },
                                ],
                        },
                ],
        },
};
`
