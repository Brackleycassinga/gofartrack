const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/renderer/index.js",
  devtool: "source-map",
  target: "electron-renderer",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "src/dist"),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "images/",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
