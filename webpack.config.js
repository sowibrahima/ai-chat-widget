const path = require('path');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  return {
    entry: {
      'ai-chat-plugin': path.resolve(__dirname, 'src/index.js'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      library: {
        name: 'aiChatWidget',
        type: 'umd',
      },
      umdNamedDefine: true,
      clean: true,
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { browsers: 'defaults' } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
    },
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
  };
};
