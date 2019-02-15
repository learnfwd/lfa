module.exports = [
  'Usage: lfa [--book[=<book-path>]] <command> [<args>]',
  '',
  'Commands:',
  '  new              Create a new project',
  '  compile          Build a project or just a specific task from a project',
  '  watch            Continuously watch the sources in a project and build incrementally',
  '  clean            Remove any build products',
  '  update-project   Update the project to the newest LFA version',
  '  help             Display this message',
].join(require('os').EOL);
