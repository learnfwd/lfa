// list of all available top-level lfa commands

module.exports = {
  'new':                    require('./new'),
  'compile':                require('./compile'),
  'watch':                  require('./watch'),
  'help':                   require('./help'),
  'version':                require('./version'),
  'create-custom-config':   require('./create-custom-config'),
  'clean':                  require('./clean'),
  'serve':                  require('./serve'),
  'update':                 require('./update')
};
