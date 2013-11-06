should = require 'should'
path = require 'path'
fs = require 'fs'
colors = require 'colors'
shell = require 'shelljs'
config = require '../lib/global_config'
run = require('child_process').exec

root = __dirname
basic_root = path.join root, 'basic'
output_folder = '_build'

files_exist = (test_path, files) ->
  for file in files
    fs.existsSync(path.join(test_path, file)).should.be.ok

files_dont_exist = (test_path, files) ->
  for file in files
    fs.existsSync(path.join(test_path, file)).should.not.be.ok

describe 'command', ->

  describe 'compile', ->

    before (done) ->
      run "cd \"#{basic_root}\"; ../../bin/lfa compile", done

    after ->
      shell.rm '-rf', path.join(basic_root, output_folder)

    it 'should compile files to ' + output_folder, ->
      fs.readdirSync(path.join(basic_root, output_folder)).should.have.lengthOf(5)

    it 'should minify all css and javascript', () ->
      js_content = fs.readFileSync path.join(basic_root, output_folder + '/js/main.js'), 'utf8'
      js_content.should.not.match /\n/

    it 'should compile all files to ' + output_folder, ->
      css_content = fs.readFileSync path.join(basic_root, output_folder + '/css/master.css'), 'utf8'
      css_content.should.not.match /\n/

  describe 'new', ->
    test_path = path.join(root, 'testproj')

    it 'should use the default template if no flags present', (done) ->
      run "cd \"#{root}\"; ../bin/lfa new testproj", ->
        files_exist(test_path,[
          '/'
          '.gitignore'
          'config.jade'
          'text'
          'text/index.jade'
          'text/layout.jade'
          'text/blank.jade'
          'text/ch01'
          'text/ch01/ch01.jade'
          'css'
          'css/master.styl'
          'js'
          'js/main.coffee'
          'js/require.js'
          'img'
        ])
        shell.rm '-rf', path.join(root, 'testproj')
        done()

  describe 'version', ->

    it 'should output the correct version number for lfa', (done) ->
      version = JSON.parse(fs.readFileSync('package.json')).version
      run './bin/lfa version', (err,out) ->
        out.replace(/\n/, '').should.eql(version)
        done()

describe 'compiler', ->
  compiler = null

  before ->
    Compiler = require path.join(root, '../lib/compiler')
    compiler = new Compiler()

  it 'eventemitter should be hooked up properly', (done) ->
    compiler.on 'finished', -> done()
    compiler.finish()

describe 'jade', ->
  test_path = path.join root, './jade'
  test_path_2 = path.join root, './no-layout'
  test_path_3 = path.join root, './subfolders'

  it 'should compile jade view templates', (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress", ->
      fs.existsSync(path.join(test_path, output_folder + '/index.html')).should.be.ok
      shell.rm '-rf', path.join(test_path, output_folder)
      done()

  it 'should compile templates with no layout', (done) ->
    run "cd #{test_path_2}; ../../bin/lfa compile --no-compress", ->
      fs.existsSync(path.join(test_path_2, output_folder + '/index.html')).should.be.ok
      shell.rm '-rf', path.join(test_path_2, output_folder)
      done()

  it 'should compile templates with no regard to subfolder structure in /text', (done) ->
    run "cd #{test_path_3}; ../../bin/lfa compile --no-compress", ->
      files_exist path.join(test_path_3, output_folder), [
        '/one.html'
        '/two.html'
        '/three.html'
        '/four.html'
      ]
      shell.rm '-rf', path.join(test_path_3, output_folder)
      done()

  it 'should not create empty folders from jade subfolders in /text', (done) ->
    run "cd #{test_path_3}; ../../bin/lfa compile --no-compress", ->
      files_dont_exist path.join(test_path_3, output_folder), [
        '/sub1'
        '/sub1/subsub1'
        '/sub2'
        '/subsub2'
      ]
      shell.rm '-rf', path.join(test_path_3, output_folder)
      done()

describe 'coffeescript', ->
  test_path = path.join root, './coffeescript'
  test_path_2 = path.join root, './coffee-basic'

  it 'should compile coffeescript and requires should work', (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress", ->
      fs.existsSync(path.join(test_path, output_folder + '/basic.js')).should.be.ok
      fs.existsSync(path.join(test_path, output_folder + '/require.js')).should.be.ok
      require_content = fs.readFileSync path.join(test_path, output_folder + '/require.js'), 'utf8'
      require_content.should.match /BASIC/
      shell.rm '-rf', path.join(test_path, output_folder)
      done()

  it 'should compile without closures when specified in app.coffee', (done) ->
    run "cd \"#{test_path_2}\"; ../../bin/lfa compile --no-compress", ->
      fs.existsSync(path.join(test_path_2, output_folder + '/testz.js')).should.be.ok
      require_content = fs.readFileSync path.join(test_path_2, output_folder + '/testz.js'), 'utf8'
      require_content.should.not.match /function/
      shell.rm '-rf', path.join(test_path_2, output_folder)
      done()

describe 'stylus', ->
  test_path = path.join root, './stylus'

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress", ->
      done()

  it 'should compile stylus with lfa css', ->
    fs.existsSync(path.join(test_path, output_folder + '/basic.css')).should.be.ok

  it 'should include the project directory for requires', ->
    fs.existsSync(path.join(test_path, output_folder + '/req.css')).should.be.ok
    fs.existsSync(path.join(test_path, output_folder + '/nested/all.css')).should.be.ok
    require_content = fs.readFileSync path.join(test_path, output_folder + '/req.css'), 'utf8'
    require_content.should.match /#000/
    shell.rm '-rf', path.join(test_path, output_folder)

describe 'static files', ->
  test_path = path.join root, './static'

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress", ->
      done()

  it 'copies static files', ->
    fs.existsSync(path.join(test_path, output_folder + '/whatever.poop')).should.be.ok
    require_content = fs.readFileSync path.join(test_path, output_folder + '/whatever.poop'), 'utf8'
    require_content.should.match /lfa dont care/
    shell.rm '-rf', path.join(test_path, output_folder)

describe 'errors', ->
  test_path = path.join root, './errors'

  it 'notifies you if theres an error', (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress", (a,b,stderr) ->
      stderr.should.match /ERROR/
      shell.rm '-rf', path.join(test_path, output_folder)
      done()

describe 'dynamic content', ->
  test_path = path.join root, './dynamic'

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress", ->
      done()
  
  after ->
    shell.rm '-rf', path.join(test_path, output_folder)

  it 'compiles into single post templates', ->
    fs.existsSync(path.join(test_path, output_folder + '/hello_world.html')).should.be.ok
    content = fs.readFileSync path.join(test_path, output_folder + '/hello_world.html'), 'utf8'
    content.should.match(/\<h1\>hello world\<\/h1\>/)
    content.should.match(/This is my first blog post/)

  it 'makes front matter available as locals', ->
    fs.existsSync(path.join(test_path, output_folder + '/index.html')).should.be.ok
    content = fs.readFileSync path.join(test_path, output_folder + '/index.html'), 'utf8'
    content.should.match(/\<a href="\/posts\/hello_world.html"\>hello world\<\/a\>/)
    content = fs.readFileSync path.join(test_path, output_folder + '/second_post.html'), 'utf8'
    content.should.match(/\<p\>second post\<\/p\>/)

  it 'exposes compiled content as site.post.contents', ->
    content = fs.readFileSync path.join(test_path, output_folder + '/index.html'), 'utf8'
    content.should.match(/\<p\>This is my first blog post.*\<\/p\>/)

describe 'precompiled templates', ->
  test_path = path.join root, './precompile'

  before (done) ->
    run "cd #{test_path}; ../../bin/lfa compile --no-compress", ->
      done()

  it 'precompiles templates', ->
    fs.existsSync(path.join(test_path, output_folder + '/js/templates.js')).should.be.ok
    require_content = fs.readFileSync path.join(test_path, output_folder + '/js/templates.js'), 'utf8'
    require_content.should.match(/\<p\>hello world\<\/p\>/)
    shell.rm '-rf', path.join(test_path, output_folder)

describe 'multipass compiles', ->
  test_path = path.join root, './multipass'

  before (done) ->
    run "cd #{test_path}; ../../bin/lfa compile --no-compress", ->
      done()

  it 'will compile a single file multiple times accurately', ->
    fs.existsSync(path.join(test_path, output_folder + '/index.html')).should.be.ok
    content = fs.readFileSync path.join(test_path, output_folder + '/index.html'), 'utf8'
    content.should.match(/blarg world/)
    shell.rm '-rf', path.join(test_path, output_folder)

# describe 'table of contents', ->
#   test_path = path.join root, './toc'
# 
#   before (done) ->
#     run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress", ->
#       done()
#   
#   after ->
#     shell.rm '-rf', path.join(test_path, output_folder)
#   
#   it 'can be generated with proper structure', ->
#     console.log "hi"