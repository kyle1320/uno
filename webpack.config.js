const path = require('path');

const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var WebpackPwaManifest = require('webpack-pwa-manifest');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const RemoveServiceWorkerPlugin = require('webpack-remove-serviceworker-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;

module.exports = function (env, argv) {
  const mode = argv.mode || 'development';
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  const BUILD_NUMBER = (process.env.GITHUB_SHA || "").substring(0, 8);

  const template = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Play Uno</title>
      ${
        isProduction
          ? `<!-- Google Tag Manager -->
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-WNF7KL2');</script>
      <!-- End Google Tag Manager -->`
          : ''
      }
    </head>
    <body>
      ${
        isProduction
          ? `<!-- Google Tag Manager (noscript) -->
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WNF7KL2"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
      <!-- End Google Tag Manager (noscript) -->`
          : ''
      }

      <div id="root"></div>
    </body>
  </html>`;

  const client = {
    mode,
    entry: './src/client/index.tsx',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    module: {
      rules: [{
          test: /\.s?css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader'
        },
        {
          test: /\.(png|jpg)$/,
          loader: 'url-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
      new webpack.DefinePlugin({
        BUILD_NUMBER: JSON.stringify(BUILD_NUMBER)
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        templateContent: template
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),
      isDevelopment && new CleanWebpackPlugin(),
      isProduction &&
      new WebpackPwaManifest({
        name: 'Uno',
        theme_color: '#ED1C24',
        background_color: '#ED1C24',
        start_url: '/',
        orientation: 'any',
        display: 'fullscreen',
        icons: [{
          src: path.resolve('./assets/icon.png'),
          sizes: [96, 128, 192, 256, 384, 512],
          destination: 'icons'
        }]
      }),
      isProduction &&
      new RemoveServiceWorkerPlugin({
        filename: 'service-worker.js'
      }),
      isProduction && new FaviconsWebpackPlugin('./assets/icon.png')
    ].filter(Boolean),
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist/public'),
      publicPath: '/'
    }
  };

  const server = {
    mode,
    entry: './src/server/index.ts',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    module: {
      rules: [{
        test: /\.ts$/,
        use: 'ts-loader'
      }]
    },
    node: {
      __dirname: false
    },
    target: 'node',
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
      new webpack.DefinePlugin({
        BUILD_NUMBER: JSON.stringify(BUILD_NUMBER)
      }),
    ],
    externals: [nodeExternals()],
    output: {
      filename: 'server.js',
      path: path.resolve(__dirname, 'dist')
    }
  };

  return [client, server];
};