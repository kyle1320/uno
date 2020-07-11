const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const template = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const client = {
  mode: 'development',
  entry: {
    homepage: './src/client/homepage.tsx',
    gameroom: './src/client/gameroom.tsx'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      },
      { test: /\.tsx?$/, use: 'ts-loader' },
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['homepage'],
      filename: 'index.html',
      templateContent: template
    }),
    new HtmlWebpackPlugin({
      chunks: ['gameroom'],
      filename: 'gameroom.html',
      templateContent: template
    }),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/public'),
    publicPath: '/'
  }
};

const server = {
  mode: 'development',
  entry: './src/server/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  },
  target: 'node',
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  externals: [nodeExternals()],
  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  ],
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
  }
};

module.exports = [client, server];