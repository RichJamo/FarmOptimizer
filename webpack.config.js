module.exports = {
    entry: './src/js/assets.js',
    mode: 'development',
    output: {
        path: `${__dirname}/dist`,
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.ttf$/,
                use: [
                  'url-loader',
                ],
              },
        ],
    },
};