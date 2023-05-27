const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        server: './src/server/server.ts',
    },
    output: {
        path: path.join(__dirname,'dist'),
        publicPath: '/',
        filename: '[name].js'        
    },
    target:'node',
    node:{
        __dirname:false,
        __filename:false
    },
    externals:[nodeExternals()],
    module:{
        rules:[
            {
                test: /\.tsx?$/,
                use:{loader:"ts-loader"},
                exclude:/node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};