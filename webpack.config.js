var webpack = require('webpack'),
    path = require('path');
 
module.exports = {
    debug: true,
    context: __dirname,
    entry: "./core/flytrap.js",
    output: {
        path: path.join(__dirname, 'dest'),
        filename: 'output2.min.js',
        libraryTarget: "var",
        library: "Flytrap"
    },
    module: {
        loaders: []
    }
};
