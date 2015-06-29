module.exports = function (config, flags) {
  if (typeof(flags.core) === 'boolean') {
    config.loadCore = flags.core;
  }
  if (typeof(flags.user) === 'boolean') {
    config.loadUser = flags.user;
  }
  if (typeof(flags.plugins) === 'boolean') {
    config.loadPlugins = flags.plugins;
  }
  if (flags.justCore) {
    config.loadCore = true;
    config.loadUser = false;
    config.loadPlugins = false;
  }
  if (flags.justUser) {
    config.loadCore = false;
    config.loadUser = true;
    config.loadPlugins = false;
  }
  if (flags.justPlugins) {
    config.loadCore = false;
    config.loadUser = false;
    config.loadPlugins = true;
  }
  if (typeof(flags.justPlugin) === 'string') {
    config.loadCore = false;
    config.loadUser = false;
    config.loadPlugins = true;
    config.loadPluginFilter = flags.justPlugin;
  }
  return config;
};
