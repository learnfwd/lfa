module.exports = [
  'Usage: lfa [--book[=<book-path>]] <command> [<args>]',
  '',
  'Commands:',
  '  compile   Build a project or just a specific task from a project',
  '  watch     Continuously watch the sources in a project and build incrementally',
  '  help      Display this message',
].join(require('os').EOL);
