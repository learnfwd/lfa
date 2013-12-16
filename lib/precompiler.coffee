jade = require 'jade'
fs = require 'fs'
path = require 'path'
_ = require 'underscore'
mkdirp = require 'mkdirp'
minimatch = require 'minimatch'
readdirp = require 'readdirp'
compressor = require './utils/compressor'

# compile jade templates into JS functions for use on the client-side, and
# save it to a specified file

module.exports = ->
  global.options.debug.log 'precompiling templates', 'yellow'
  return false if not global.options.templates?
  template_dir = path.join(process.cwd(), global.options.templates)

  options =
    root: template_dir
    directoryFilter: global.options.ignore_folders
    fileFilter: global.options.ignore_files

  readdirp options, (err, res) ->
    precompiler = new Precompiler(
      templates: _.map(res.files, (f) -> f.fullPath)
    )
    
    precompiler.templates.push path.join __dirname, '..', 'templates/clientjs/search_result.jade'
    
    buf = precompiler.compile()
    buf = compressor buf, 'js' if global.options.compress

    output_path = path.join(process.cwd(), global.options.output_folder, '/js/templates.js')
    mkdirp.sync path.dirname(output_path)
    fs.writeFileSync output_path, buf
    
    search_content = global.options.search_content
    
    cleantoc = (chapters) ->
      i = 0
      len = chapters.length
      while i < len
        delete chapters[i].locals.html
        delete chapters[i].locals.text
        if chapters[i].children and chapters[i].children.length
          chapters[i].children = cleantoc(chapters[i].children)
        i++
      
      return chapters
    
    toc = cleantoc global.options.toc
    
    global.options.debug.log(require('util').inspect(toc, false, null), "yellow")
    
    search_content = 'define({ pages: ' + JSON.stringify(search_content) + ', toc: ' + JSON.stringify(toc) + '});'
    fs.writeFileSync '_build/js/searchjson.js', search_content
    global.options.debug.log 'generated js/searchjson.js', 'yellow'


class Precompiler

  ###*
   * deals with setting up the variables for options
   * @param {Object} options = {} an object holding all the options to be
     passed to the compiler. 'templates' must be specified.
   * @constructor
  ###
  constructor: (options = {}) ->
    defaults =
      include_helpers: true
      inline: false
      debug: false
      namespace: 'templates'
      templates: undefined # an array of template filenames

    _.extend @, defaults, options

  ###*
   * loop through all the templates specified, compile them, and add a wrapper
   * @return {String} the source of a JS object which holds all the templates
   * @public
  ###
  compile: ->
    buf = ["""
    define(function(){
      var #{@namespace} = {};
      #{@helpers() if @include_helpers isnt false and @inline isnt true}
    """]

    for template in @templates
      buf.push @compileTemplate(template).toString()

    buf.push '; return templates;});'
    buf.join ''

  ###*
   * compile individual templates
   * @param {String} template the full filename & path of the template to be
     compiled
   * @return {String} source of the template function
   * @private
  ###
  compileTemplate: (template) ->
    basePath = template.split(path.join(process.cwd(), global.options.templates)+ "/")[1]
    if !basePath # if it's a template from the lfa/templates folder
      basePathSplit = template.split('/')
      basePath = basePathSplit[basePathSplit.length - 1]
    
    templateNamespace = basePath.split('.jade')[0].replace(/\//g, '-')

    data = fs.readFileSync(template, 'utf8')
    
    data = global.options.mixins + "\n" + data if global.options.mixins
    
    data = jade.compile(
      data,
      {compileDebug: @debug || false, inline: @inline || false, client: true, self: true}
    )
    "#{@namespace}['#{templateNamespace}'] = #{data};\n"

  ###*
   * Gets Jade's helpers and combines them into string
   * @return {String} source of Jade's helpers
   * @private
  ###
  helpers: ->
    # jade has a few extra helpers that aren't exported. we should probably
    # figure out a way to pull all of runtime.js
    nulls = `function nulls(val) { return val != null && val !== '' }`
    joinClasses = `function joinClasses(val) { return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val; }`

    buf = [
      jade.runtime.attrs.toString().replace(/exports\./g,''),
      jade.runtime.escape.toString(),
      nulls.toString(),
      joinClasses.toString()
    ]

    buf.push jade.runtime.rethrow.toString() if @debug

    buf.push """
    var jade = {
      attrs: attrs,
      escape: escape #{
        if @debug then ',\n  rethrow: rethrow' else ''
      }
    };
    """

    buf.join('\n')
