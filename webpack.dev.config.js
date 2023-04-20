const express = require('express')
const path = require('path')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const { merge } = require('webpack-merge')
const { baseConfig, paths } = require('./webpack.base.config.js')

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        historyApiFallback: true,
        static: {
            directory: paths.build,
            watch: {
                ignored: /node_modules/
            },
        },
        port: 3000,
        hot: true,
        open: true,
        compress: true,
        client: {
            logging: 'info',
            overlay: {
                warnings: false,
                errors: true
            }
        },
        setupMiddlewares: (middlewares, devServer) => {
            devServer.app.use('/static/frontend/', express.static(path.resolve(paths.public)))
            return middlewares
        }
    },
    plugins: [
        new ReactRefreshPlugin(),
        new ForkTsCheckerPlugin({
            async: false
        }),
        new ESLintPlugin({
            extensions: ['js', 'jsx', 'ts', 'tsx']
        })
    ]
})