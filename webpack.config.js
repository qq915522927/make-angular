const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.js",

	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html"
		})
	],

	mode: "development",

	// 开发服务器 devServer：用来自动化（自动编译，自动打开浏览器，自动刷新浏览器~~）
	// 特点：只会在内存中编译打包，不会有任何输出
	// 启动devServer指令为：npx webpack-dev-server
	devServer: {
		// 项目构建后路径
		contentBase: resolve(__dirname, "dist"),
		// 启动gzip压缩
		compress: true,
		// 端口号
		port: 8999,
		// 自动打开浏览器
		open: true
	},
	devtool: 'eval-source-map'
};
