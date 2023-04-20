const { merge } = require('webpack-merge')
const { baseConfig, paths } = require('./webpack.base.config.js')

module.exports = merge(baseConfig, {
    mode: 'production',
    devtool: false,
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