var path = require('path');
var webpack = require('webpack');
module.exports = {
    "entry": {
        login: path.join(__dirname, "src/login.bundle.js")
    },
    "output": {
        "filename": "[name].bundle.js",
        "path": path.join(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            }
        }, {
            test: /\.less$/,
            include: [
                path.resolve(__dirname, 'src/less')
            ],
            use: [{
                    loader: 'style-loader'
                },
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1
                    }
                },
                {
                    loader: 'less-loader',
                    options: {
                        strictMath: true,
                        noIeCompat: true
                    }
                }
            ]
        }]
    },
    plugins: [
        // build optimization plugins
        new webpack.optimize.CommonsChunkPlugin({
            name: 'login',
            filename: 'login.bundle.min.js',
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
            }
        }),
    ]
}