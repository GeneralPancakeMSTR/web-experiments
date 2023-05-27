const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        main: './src/ts/index.ts'
    },    
    output: {
        path: path.join(__dirname,'dist'),
        publicPath: '/',
        filename: '[name].js',        
    },
    target:'web',
    devtool: 'inline-source-map',    
    module: {
        rules :[
            {
                test: /\.tsx?$/,
                use: {loader:"ts-loader"},
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: [{loader: "html-loader"}]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    
    node:{
        __dirname:false,
        __filename:false
    },
    
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/html/index.html",
            filename: "./index.html",
            excludeChunks: ['server']
        })
    ]
};