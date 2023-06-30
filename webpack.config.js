const path = require("path");
// const webpack = require("webpack");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./public/js/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public/dist")
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: "html-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".css", ".html"]
  },
  devServer: {
    static: path.join(__dirname, "public"),
    hot: true,
    open: true
  },
  plugins: [new CleanWebpackPlugin()],
  // set to development or production
  mode: "development"
};
