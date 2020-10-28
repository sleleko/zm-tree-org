const path = require('path')
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
    // 将entry指向examples
    pages: {
        index: {
            entry: 'demo/main.js',
            template: 'public/index.html',
            filename: 'index.html'
        }
    },
    // 为packages目录添加babel-loader处理
    chainWebpack: config => {
        config.module
        .rule('js')
        .include
            .add(resolve('packages'))
            .end()
        .use('babel')
            .loader('babel-loader')
            .tap(options => {
                return options
            })
    },
    css: {
      requireModuleExtension: true,
      sourceMap: true,
      loaderOptions: {
        scss: {
          /*sass-loader 8.0语法 */
          //prependData: '@import "~@/styles/variables.scss";',

          /*sass-loader 9.0写法，感谢github用户 shaonialife*/
          additionalData(content, loaderContext) {
            const { resourcePath, rootContext } = loaderContext;
            const relativePath = path.relative(rootContext, resourcePath);
            /*if (
              relativePath.replace(/\\/g, "/") !== "src/styles/variables.scss"
            ) {
              return '@import "~@/styles/variables.scss";' + content;
            }*/
            return content;
          },
        },
      },
    },
}