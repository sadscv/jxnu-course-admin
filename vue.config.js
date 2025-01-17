const WorkerPlugin = require('worker-plugin')
const path = require('path')
const webpack = require('webpack')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const GitRevision = new GitRevisionPlugin()
const buildDate = JSON.stringify(new Date().toLocaleString())
const createThemeColorReplacerPlugin = require('./config/plugin.config')

function resolve (dir) {
  return path.join(__dirname, dir)
}

// check Git
function getGitHash () {
  try {
    return GitRevision.version()
  } catch (e) {}
  return 'unknown'
}

const isProd = process.env.NODE_ENV === 'production'

const assetsCDN = {
  // webpack build externals
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios'
  },
  css: [],
  // https://unpkg.com/browse/vue@2.6.10/
  js: [
    // '//lf6-cdn-tos.bytecdntp.com/cdn/expire-100-y/vue/2.6.4/vue.min.js',
    '//cdn.staticfile.net/vue/2.6.14/vue.min.js',
    // '//cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js',
    // '//lf26-cdn-tos.bytecdntp.com/cdn/expire-100-y/vue-router/3.5.1/vue-router.min.js',
    // '//cdn.jsdelivr.net/npm/vue-router@3.5.1/dist/vue-router.min.js',
    '//cdn.staticfile.net/vue-router/3.5.1/vue-router.min.js',
    // '//lf6-cdn-tos.bytecdntp.com/cdn/expire-100-y/vuex/3.1.1/vuex.min.js',
    // '//cdn.jsdelivr.net/npm/vuex@3.1.1/dist/vuex.min.js',
    '//cdn.staticfile.net/vuex/3.1.1/vuex.min.js',
    // '//lf26-cdn-tos.bytecdntp.com/cdn/expire-100-y/axios/0.21.1/axios.min.js',
    '//cdn.staticfile.net/axios/0.21.1/axios.min.js'
  ]
}

// vue.config.js
const vueConfig = {
  configureWebpack: {
    // webpack plugins
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new WorkerPlugin({
        globalObject: 'self'
      }),
      new webpack.DefinePlugin({
        APP_VERSION: `"${require('./package.json').version}"`,
        GIT_HASH: JSON.stringify(getGitHash()),
        BUILD_DATE: buildDate
      })
    ],
    // if prod, add externals
    externals: isProd ? assetsCDN.externals : {}
  },

  lintOnSave: false,
  chainWebpack: config => {
    config.resolve.alias.set('@$', resolve('src'))

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]',
        esModule: false
      })

    // if prod is on
    // assets require on cdn
    if (isProd) {
      config.plugin('html').tap(args => {
        args[0].cdn = assetsCDN
        return args
      })
    }
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // less vars，customize ant design theme

          // 'primary-color': '#F5222D',
          // 'link-color': '#F5222D',
          'border-radius-base': '2px'
        },
        // DO NOT REMOVE THIS LINE
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    // development server port 8000
    // port: 8000
    // If you want to turn on the proxy, please remove the mockjs /src/main.jsL11
    proxy: {
      '/API/v1.0': {
        // target: 'http://219.229.250.21:8080',
        // target: 'http://127.0.0.1:5000',
        target: 'http://172.16.3.205:5000',
        secure: false,
        ws: false,
        changeOrigin: true
      },
      '/static/file': {
        target: 'http://127.0.0.1:5000',
        // target: 'http://150.158.195.65:7015',
        secure: false,
        ws: false,
        changeOrigin: true
      }
    }
  },

  // disable source map in production
  productionSourceMap: false,
  // lintOnSave: undefined,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: []
}

// preview.pro.loacg.com only do not use in your production;
if (process.env.VUE_APP_PREVIEW === 'true') {
  // add `ThemeColorReplacer` plugin to webpack plugins
  vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin())
}

module.exports = vueConfig
