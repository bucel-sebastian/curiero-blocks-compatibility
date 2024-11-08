const path = require("path");

const WooCommerceDependencyExtractionWebpackPlugin = require("@woocommerce/dependency-extraction-webpack-plugin");
const { plugins } = require("@wordpress/data");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              [
                "@babel/preset-react",
                {
                  runtime: "automatic",
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new WooCommerceDependencyExtractionWebpackPlugin({
      bundledPackages: ["@woocommerce/*"],
    }),
  ],
  // externals: {
  //   "@wordpress/element": "window.wp.element",
  //   "@wordpress/plugins": "window.wp.plugins",
  //   "@wordpress/data": "window.wp.data",
  //   "@wordpress/notices": "window.wp.notices",
  //   "@wordpress/components": "window.wp.components",
  //   "@wordpress/i18n": "window.wp.i18n",
  //   "@wordpress/hooks": "window.wp.hooks",
  //   "@wordpress/blocks": "window.wp.blocks",
  //   "@wordpress/blocks-checkout": "window.wc.blocksCheckout",
  //   "@woocommerce/block-data": "window.wc.wcBlocksData",
  //   "@woocommerce/base-contexts": "window.wc.wcBaseContexts",
  //   "@woocommerce/checkout": "window.wc.checkout",
  //   "@woocommerce/settings": "window.wc.wcSettings",
  //   react: "window.React",
  //   "react-dom": "window.ReactDOM",
  //   "react-select2-wrapper": "react-select2-wrapper",
  // },
};
