// vue.config.js
module.exports = {
    devServer: {
        host: '0.0.0.0',
        port: process.env.VUE_APP_CLIENT_PORT,
        public: process.env.VUE_APP_CLIENT_ADDRESS,
        disableHostCheck: true
    },
}
