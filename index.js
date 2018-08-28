module.exports = (api, options) => {
  if (options.pluginOptions.quasar.rtlSupport) {
    process.env.QUASAR_RTL = true
  }

  api.chainWebpack(chain => {
    const
      theme = process.env.QUASAR_THEME || options.pluginOptions.quasar.theme,
      importAll = options.pluginOptions.quasar.importAll

    if (!importAll) {
      chain.resolve.extensions
        .merge([ `.${theme}.js` ])

      chain.plugin('define')
        .tap(args => {
          const { 'process.env': env, ...rest } = args[0]
          return [{
            'process.env': Object.assign(
              {},
              env,
              { THEME: JSON.stringify(theme) }
            ),
            ...rest
          }]
        })
    }

    chain.resolve.alias
      .set(
        'quasar',
        importAll
          ? api.resolve(`node_modules/quasar-framework/dist/quasar.${theme}.esm.js`)
          : 'quasar-framework'
      )
      .set('variables', api.resolve(`src/styles/quasar.variables.styl`))
      .set('quasar-variables', api.resolve(`node_modules/quasar-framework/src/css/core.variables.styl`))
      .set('quasar-styl', api.resolve(`node_modules/quasar-framework/dist/quasar.${theme}.styl`))
      .set('quasar-addon-styl', api.resolve(`node_modules/quasar-framework/src/css/flex-addon.styl`))

    chain.performance
      .maxEntrypointSize(512000)
  })

  api.registerCommand('build:quasar', {
    description: 'build app with both Material and iOS themes',
    usage: 'vue-cli-service build:quasar [options passed to build]',
    details:
      `All args will be treated as if in a regular build.\n` +
      `See https://github.com/quasarframework/vue-cli-plugin-quasar for more details about this plugin.`
  }, async (args) => {
    const build = theme => {
      // Have each build output to it's own directory
      args.dest = `dist/quasar-theme-${theme}`
      // Tell chainWebpack function which theme to use
      process.env.QUASAR_THEME = theme

      console.log(`Building app with ${theme} theme...`)
      // Run build command
      return api.service.run('build', args)
    }

    await build('mat')
    await build('ios')
  })
}

module.exports.defaultModes = {
  'build:quasar': 'production'
}
