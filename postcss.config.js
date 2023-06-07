module.exports = {
    plugins: [
        // Includes autoprefixer
        require('postcss-preset-env')({
            stage: 2
        }),
        require('postcss-color-rgba-fallback')(),
        require('postcss-flexbugs-fixes')
    ]
}