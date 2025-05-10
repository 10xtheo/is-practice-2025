const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';
	const config = {
		entry: './src/index.tsx',
		output: {
			filename: 'bundle.js',
		},
		module: {
			rules: [
				{
					test: /\.(ts|js)x?$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
					},
				},
				{
					test: /\.s?css$/,
					use: [
						isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
						{
							loader: 'css-loader',
							options: {
								modules: {
									auto: true,
								},
							},
						},
						{
							loader: 'sass-loader',
						},
					],
				},
				{
					test: /\.(png|jpg|gif|ico|svg)$/,
					type: 'asset/resource',
				},
			],
		},
		resolve: {
			extensions: ['.js', '.jsx', '.tsx', '.ts', '.scss'],
			alias: {
				components: path.resolve(__dirname, '.', 'src', 'components'),
				gateway: path.resolve(__dirname, '.', 'src', 'gateway'),
				hooks: path.resolve(__dirname, '.', 'src', 'hooks'),
				providers: path.resolve(__dirname, '.', 'src', 'providers'),
				utils: path.resolve(__dirname, '.', 'src', 'utils'),
				types: path.resolve(__dirname, '.', 'src', 'types'),
				store: path.resolve(__dirname, '.', 'src', 'store'),
				'validation-schemas': path.resolve(__dirname, '.', 'src', 'validation-schemas'),
			},
		},
		plugins: [
			new webpack.ProgressPlugin(),
			new CleanWebpackPlugin(),
			new HtmlWebpackPlugin({
				template: './src/index.html',
				favicon: './src/assets/favicon.ico',
			}),
			new CopyWebpackPlugin({
				patterns: [{ from: 'src/assets', to: 'assets' }],
			}),
		],
		devServer: {
			historyApiFallback: true,
			open: true,
			hot: true,
			port: 5173,
		},
	};

	if (isProduction) {
		config.plugins.push(new webpack.HotModuleReplacementPlugin());
	}

	if (isProduction) {
		config.plugins.push(
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
		);
	}

	return config;
};
