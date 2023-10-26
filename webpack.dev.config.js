const path = require('path')
const webpack = require('webpack')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const { merge } = require('webpack-merge')
const {
    baseConfig, paths, 
    createBabelLoader, createCopyPlugin, createHtmlWebpackPlugin,
    createMiniCssExtractPlugin
} = require('./webpack.base.config.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
        }
    },
    module: {
        rules: [ createBabelLoader({ isDevelopment: true }) ]
    },
    plugins: [
        createMiniCssExtractPlugin({ isDevelopment: true }),
        createHtmlWebpackPlugin({ isDevelopment: true }),
        new ReactRefreshPlugin(),
        new ForkTsCheckerPlugin({
            async: false
        }),
        new ESLintPlugin({
            extensions: ['js', 'jsx', 'ts', 'tsx']
        }),
        new webpack.EnvironmentPlugin({
            'NODE_ENV': 'development'
        }),
        createCopyPlugin({ isDevelopment: true })
    ]
})