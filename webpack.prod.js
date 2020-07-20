const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
var WebpackPwaManifest = require('webpack-pwa-manifest');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const template = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Play Uno</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const client = {
  mode: 'production',
  entry: './src/client/index.tsx',
  devtool: 'source-map',
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
      filename: 'index.html',
      templateContent: template
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
    new WebpackPwaManifest({
      name: 'Uno',
      theme_color: '#ED1C24',
      background_color: '#ED1C24',
      start_url: '/',
      orientation: 'any',
      display: 'fullscreen',
      icons: [
        {
          src: path.resolve('./assets/icon.png'),
          sizes: [96, 128, 192, 256, 384, 512],
          destination: 'icons'
        }
      ]
    }),
    new FaviconsWebpackPlugin('./assets/icon.svg')
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/public'),
    publicPath: '/'
  }
};

const server = {
  mode: 'production',
  entry: './src/server/index.ts',
  devtool: 'source-map',
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
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
  }
};

module.exports = [client, server];