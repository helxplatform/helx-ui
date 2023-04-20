const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { merge } = require('webpack-merge')
const { baseConfig, paths, createBabelLoader, createCopyPlugin } = require('./webpack.base.config.js');

console.log("Creating optimized production build. This may take a while...")
module.exports = merge(baseConfig, {
    mode: 'production',
    entry: {
        main: paths.entryPoint,
        vendor: ['react', 'react-dom', 'antd']
    },
    output: {
        publicPath: '/static/frontend/'
    },
    devtool: false,
    module: {
        rules: [ createBabelLoader({ isDevelopment: false }) ]
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            'NODE_ENV': 'production'
        }),
        createCopyPlugin({ isDevelopment: false })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin()
        ],
        splitChunks: {
            chunks: 'all'
        },
        runtimeChunk: true
    }
})