var webpack = require('webpack');

module.exports = {
    entry: './client/js/app',
    output: {
        path: __dirname + '/client',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {test : /\.jsx$/, loader  : 'jsx'},
            {test : /\.css$/, loader  : 'style!css'},
            {test : /\.less$/, loader : 'style!css!less'},
            {test : /\.md$/, loader   : 'html!markdown'},
            {test : /\.html$/, loader : 'raw'},
            {test : /\.txt$/, loader  : 'raw'},
            {test : /\.json$/, loader : 'json'}
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            '_'      : 'lodash',
            '$'      : 'jquery',
            'jQuery' : 'jquery',
            'React'  : 'react'
        })
    ],
    bail: true,
    target: 'node'
}
