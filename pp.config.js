import path from 'node:path';
import { defineConfig } from '@ysf/cli';
import checkSyntax from '@ysf/cli-plugin-check-syntax';
import twin from '@ysf/cli-plugin-twin';
import yspack from '@ysf/cli-plugin-yspack';

const RoutesTypeGenerator = require('./plugins/RoutesTypeGenerator');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).help(false).version(false).parse();
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const useHttps = argv.https || false;
/** 静态部署平台 环境变量 */
const BUILD_ENV = argv.env || (isDev ? 'dev' : 'online');

// cli 文档：https://g.hz.netease.com/ysf/web-project/frontend/ppcli/ppf2e/-/tree/master/packages/cli
export default defineConfig({
  plugins: [twin(), yspack()],

  // yspack 文档：https://g.hz.netease.com/ysf/web-project/frontend/ppcli/ppf2e/-/tree/master/packages/plugin-yspack
  yspack: {
    webpack: {
      entry: {
        app: './src/App.tsx',
        'ai-build': './src/pages/AiBuildAssistant/ai-build-main.jsx',
      },
    },
    // 用户自定义webpack配置，相比于merge拥有更加灵活的实用方式
    chainWebpack(webpackConfig) {
      webpackConfig.output.set('clean', true);
      if (isDev) {
        webpackConfig.plugin('RoutesTypeGenerator').use(RoutesTypeGenerator); // 生成路由声明
      }
      // 为 ai-build 独立入口添加 HTML 模板
      const HtmlWebpackPlugin = require('html-webpack-plugin');
      webpackConfig.plugin('HtmlWebpackPluginAiBuild').use(HtmlWebpackPlugin, [
        {
          filename: 'ai-build.html',
          template: 'ai-build.html',
          chunks: ['ai-build'],
        },
      ]);
      webpackConfig.plugin('MonacoWebpackPlugin').use(MonacoWebpackPlugin, [
        {
          languages: ['javascript', 'python'], // 只包含项目实际使用的语言
          features: ['!typescript'], // 排除 TypeScript 相关功能
        },
      ]); // 生成路由声明
      webpackConfig.optimization.splitChunks({
        chunks: 'all',
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          // 常用基础库
          constvendors: {
            name: 'constvendors',
            test: /[\\/]node_modules([\\/]react|[\\/]react-dom|[\\/]react-router|[\\/]react-router-dom|[\\/]redux|[\\/]redux-thunk|[\\/]react-redux|[\\/]react-router-redux|[\\/]lodash|[\\/]core-js|[\\/]axios|[\\/]babel-polyfill)[\\/]/,
            priority: 10,
          },
          typescript: {
            name: 'typescript',
            test: /[\\/]node_modules[\\/]typescript[\\/]/,
            priority: 10,
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
          shikijs: {
            name: 'shikijs',
            test: /[\\/]node_modules[\\/]@shikijs[\\/]/,
            priority: 6,
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
          workflowx6: {
            name: 'workflowx6',
            //改成 @antv
            test: /[\\/]node_modules[\\/]@antv[\\/]/,
            priority: 5,
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
          workflowLibs: {
            name: 'workflowLib',
            // 加一个@coze-editor
            test: /[\\/]node_modules[\\/](@douyinfe|@flowgram\.ai|@coze-editor)[\\/]/,
            priority: 5,
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
          monaco: {
            name: 'monaco',
            test: /[\\/]node_modules[\\/](@monaco-editor|monaco-editor)[\\/]/,
            priority: 9,
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
          // 其他第三方库
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          // 业务公共模块
          common: {
            name: 'common',
            priority: -20,
            minChunks: 2,
            reuseExistingChunk: true,
          },
          // 禁用默认规则
          default: false,
        },
      });
    },
    publicPath: isDev ? '/' : 'https://res.qiyukf.net/web-ai-agent/',
    outputPath: 'dist',
    htmlWebpack: {
      filename: 'index.html',
      template: 'index.html',
      chunks: ['app'],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@form': path.resolve(__dirname, './src/pages/Workflow/NewGraph/form-components'),
    },
    targets: false,
    autoprefixer: {
      grid: 'autoplace',
    },
    lessLoader: {
      lessOptions: {
        // 如果使用less-loader@5，请移除 lessOptions 这一级直接配置选项。
        modifyVars: {
          'primary-color': '#337EFF',
          'btn-border-radius-base': '4px',
        },
        javascriptEnabled: true,
      },
    },
    define: {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      BUILD_ENV: JSON.stringify(BUILD_ENV),
    },
    devServer: {
      client: { overlay: false }, // 关闭报错全屏展示
      open: true,
      port: 8080,
      proxy: [
        {
          context: ['/a2ui/api'],
          target: 'http://10.242.138.4:3000',
          changeOrigin: true,
          pathRewrite: { '^/a2ui/api': '/api' },
        },
        {
          context: ['/agent/api'],
          target: 'https://ys-test.netease.com',
          cookieDomainRewrite: '',
          changeOrigin: true,
          secure: false,
        },
        {
          context: ['/api/qiyu'],
          target: 'https://qiyukf.com',
          changeOrigin: true,
          pathRewrite: { '^/api/qiyu': '/openapi' },
        },
        {
          context: ['/api/agent'],
          target: 'http://we-aigc.ys-test.service.163.org',
          changeOrigin: true,
          pathRewrite: { '^/api/agent': '/openapi' },
        },
      ],
    },
    // devtool开发环境推荐指南：https://webpack.docschina.org/configuration/devtool/#development
    devtool: ['onlineGray', 'online', 'oversea'].includes(BUILD_ENV) ? false : 'eval-cheap-module-source-map',
    manifest: {
      publicPath: '/',
    },
    jsMinifier: 'terser',
    jsMinifierOptions: {},
  },
});
