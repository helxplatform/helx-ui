module.exports = {
    plugins: [
        require('postcss-import'),
        // Includes autoprefixer
        require('postcss-preset-env')({
            stage: 2
        }),
        require('postcss-color-rgba-fallback')(),
        require('postcss-flexbugs-fixes')
    ]
}