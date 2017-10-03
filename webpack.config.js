var webpack = require('webpack');
var path = require('path');
require('babel-polyfill');


var DIST_DIR = path.resolve(__dirname,'dist');
var SRC_DIR = path.resolve(__dirname,'src');

var config = {
    entry:['babel-polyfill',SRC_DIR+'/app/index.js'],
    output:{
        path:DIST_DIR,
        filename:"bundle.js",
        publicPath:"/dist"
   },
    devtool: 'source-map',
    plugins: [
  ],
  devServer: { 
    host:'localhost',
    port: 6127,
},
  module:{
        rules: [
      // Javascript
      // {
      //   test: /\.js$/,
      //   loader: 'eslint-loader',
      //   include: SRC_DIR,
      //   exclude: /node_modules/,
      //   enforce: 'pre',
      //   options: {
      //     fix: true,
      //   }
      // },
      {
        test: /\.js$/,
        include: SRC_DIR,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-2']
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]'
      }
    ]

    },

    node:{
      fs: 'empty',
       child_process: "empty"

    }
}


module.exports= config;
