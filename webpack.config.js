const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            ['@babel/preset-react', {
                                "runtime": "automatic"
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    externals: {
        '@wordpress/element': 'window.wp.element',
        '@wordpress/plugins': 'window.wp.plugins',
        '@wordpress/data': 'window.wp.data',
        '@wordpress/components': 'window.wp.components',
        '@wordpress/i18n': 'window.wp.i18n',
        '@wordpress/blocks-checkout': 'window.wc.blocksCheckout',
        react: 'window.React',
        'react-dom': 'window.ReactDOM',
        'react-select2-wrapper': 'react-select2-wrapper'
    }
};
