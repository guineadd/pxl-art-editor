import path from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

export default {
  entry: "./public/js/index.js",
  output: {
    filename: "bundle.js",
    path: path.join(path.resolve(), "public/dist")
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
    static: path.join(path.resolve(), "public"),
    hot: true,
    open: true
  },
  plugins: [new CleanWebpackPlugin()],
  // set to development or production
  mode: "development"
};
