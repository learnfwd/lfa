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
      fs.readdirSync(path.join(basic_root, output_folder)).should.have.lengthOf(6)

    it 'should minify all css and javascript', ->
      js_content = fs.readFileSync path.join(basic_root, output_folder + '/js/main.js'), 'utf8'
      js_content.should.not.match /\n/

    it 'should compile all files to ' + output_folder, ->
      css_content = fs.readFileSync path.join(basic_root, output_folder + '/css/master.css'), 'utf8'
      css_content.should.not.match /\n/
  
    it 'and clean should destroy the ' + output_folder + ' folder', ->
      run "cd \"#{basic_root}\"; ../../bin/lfa clean", ->
        fs.existsSync(path.join(basic_root, output_folder)).should.not.be.ok

  describe 'new', ->
    test_path = path.join(root, 'testproj')

    it 'should use the default template if no flags present', (done) ->
      run "cd \"#{root}\"; ../bin/lfa new testproj", ->
        files_exist(test_path, [
          '/'
          '.gitignore'
          'config.jade'
          'text'
          'text/index.jade'
          'text/ch01'
          'text/ch01/ch01.jade'
          'css'
          'css/master.styl'
          'js'
          'js/main.coffee'
          'js/require.js'
          'img'
          'img/kitten.jpg'
        ])
        shell.rm '-rf', path.join(root, 'testproj')
        done()
  
  describe 'version', ->
    it 'should output the correct version number for lfa', (done) ->
      version = JSON.parse(fs.readFileSync('package.json')).version
      run './bin/lfa version', (err,out) ->
        out.replace(/\n/, '').should.eql(version)
        done()
  
  describe 'arguments', ->
    describe 'should allow compile to', ->
      it 'include component library', (done) ->
        run "cd \"#{basic_root}\"; ../../bin/lfa compile --no-compress --components=true", ->
          fs.readdirSync(path.join(basic_root, output_folder)).should.have.lengthOf(6)
          shell.rm '-rf', path.join(basic_root, output_folder)
          done()
      it 'not include component library', (done) ->
        run "cd \"#{basic_root}\"; ../../bin/lfa compile --no-compress --components=false", ->
          fs.readdirSync(path.join(basic_root, output_folder)).should.have.lengthOf(5)
          shell.rm '-rf', path.join(basic_root, output_folder)
          done()
      it 'still not include component library when config.jade says so', (done) ->
        path_no_comp = path.join(root, 'no-components');
        run "cd \"#{path_no_comp}\"; ../../bin/lfa compile --no-compress", ->
          fs.readdirSync(path.join(path_no_comp, output_folder)).should.have.lengthOf(5)
          shell.rm '-rf', path.join(path_no_comp, output_folder)
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
  test_path_2 = path.join root, './subfolders'

  it 'should compile jade view templates', (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
      fs.existsSync(path.join(test_path, output_folder + '/index.html')).should.be.ok
      shell.rm '-rf', path.join(test_path, output_folder)
      done()

  it 'should compile templates with regard to subfolder structure in /text', (done) ->
    run "cd #{test_path_2}; ../../bin/lfa compile --no-compress --components=false", ->
      files_exist path.join(test_path_2, output_folder), [
        '/00.html'
        '/01/00.html'
        '/02/00.html'
        '/02/01/00.html'
      ]
      shell.rm '-rf', path.join(test_path_2, output_folder)
      done()

describe 'coffeescript', ->
  test_path = path.join root, './coffeescript'
  test_path_2 = path.join root, './coffee-basic'

  it 'should compile coffeescript and requires should work', (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
      fs.existsSync(path.join(test_path, output_folder + '/basic.js')).should.be.ok
      fs.existsSync(path.join(test_path, output_folder + '/require.js')).should.be.ok
      require_content = fs.readFileSync path.join(test_path, output_folder + '/require.js'), 'utf8'
      require_content.should.match /BASIC/
      shell.rm '-rf', path.join(test_path, output_folder)
      done()

  it 'should compile without closures when specified in app.coffee', (done) ->
    run "cd \"#{test_path_2}\"; ../../bin/lfa compile --no-compress --components=false", ->
      fs.existsSync(path.join(test_path_2, output_folder + '/testz.js')).should.be.ok
      require_content = fs.readFileSync path.join(test_path_2, output_folder + '/testz.js'), 'utf8'
      require_content.should.not.match /function/
      shell.rm '-rf', path.join(test_path_2, output_folder)
      done()

describe 'stylus', ->
  test_path = path.join root, './stylus'

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
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
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
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
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
      done()
  
  after ->
    shell.rm '-rf', path.join(test_path, output_folder)

  it 'compiles into single post templates', ->
    fs.existsSync(path.join(test_path, output_folder + '/posts/hello_world.html')).should.be.ok
    content = fs.readFileSync path.join(test_path, output_folder + '/posts/hello_world.html'), 'utf8'
    content.should.match(/This is my first blog post/)

  it 'makes front matter available as locals', ->
    fs.existsSync(path.join(test_path, output_folder + '/index.html')).should.be.ok
    content = fs.readFileSync path.join(test_path, output_folder + '/index.html'), 'utf8'
    content.should.match(/\<a href="\/posts\/hello_world.html"\>hello world\<\/a\>/)
    content = fs.readFileSync path.join(test_path, output_folder + '/posts/second_post.html'), 'utf8'
    content.should.match(/\<p\>second post\<\/p\>/)

  it 'exposes compiled content as site.post.contents', ->
    content = fs.readFileSync path.join(test_path, output_folder + '/index.html'), 'utf8'
    content.should.match(/\<p\>This is my first blog post.*\<\/p\>/)

describe 'precompiled templates', ->
  test_path = path.join root, './precompile'

  before (done) ->
    run "cd #{test_path}; ../../bin/lfa compile --no-compress --components=false", ->
      done()

  it 'precompiles templates', ->
    fs.existsSync(path.join(test_path, output_folder + '/js/templates.js')).should.be.ok
    require_content = fs.readFileSync path.join(test_path, output_folder + '/js/templates.js'), 'utf8'
    require_content.should.match(/\<p\>hello world\<\/p\>/)
    shell.rm '-rf', path.join(test_path, output_folder)

describe 'multipass compiles', ->
  test_path = path.join root, './multipass'

  before (done) ->
    run "cd #{test_path}; ../../bin/lfa compile --no-compress --components=false", ->
      done()
  
  after ->
    shell.rm '-rf', path.join(test_path, output_folder)

  it 'will compile a single file multiple times accurately', ->
    fs.existsSync(path.join(test_path, output_folder + '/index.html')).should.be.ok
    content = fs.readFileSync path.join(test_path, output_folder + '/index.html'), 'utf8'
    content.should.match(/blarg world/)

describe 'frontmatter', ->
  test_path = path.join root, './frontmatter'
  output_path = path.join(test_path, output_folder)

  before (done) ->
    run "cd #{test_path}; ../../bin/lfa compile --no-compress --components=false", ->
      done()
  
  after ->
    shell.rm '-rf', output_path
    
  describe 'output folder should contain', ->
    it 'file with frontmatter', ->
      files_exist output_path, ['fm.html']
    it 'file with frontmatter that specifies layout', ->
      files_exist output_path, ['fm-layout.html']

describe 'table of contents', ->
  test_path = path.join root, './toc'

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
      done()
  
  after ->
    shell.rm '-rf', path.join(test_path, output_folder)
  
  describe 'can be generated with proper structure', ->
    it 'all pages should have the complete toc', ->
      content1 = fs.readFileSync path.join(test_path, output_folder + '/02-uses-metals.html'), 'utf8'
      content1.should.match(/Uses of common metals/)
      content1.should.match(/Uses of common non-metals/)
    
      content2 = fs.readFileSync path.join(test_path, output_folder + '/03-uses-non-metals.html'), 'utf8'
      content1.should.match(/Uses of common metals/)
      content1.should.match(/Uses of common non-metals/)
    

describe 'mixins', ->
  test_path = path.join root, './mixins'
  output_path = path.join(test_path, output_folder)

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
      done()
  
  after ->
    shell.rm '-rf', path.join(test_path, output_folder)
  
  describe 'are included into the build path', ->
    
    it '+img() works', ->
      content1 = fs.readFileSync path.join(test_path, output_folder + '/index.html'), 'utf8'
      content1.should.match(/\<img src=\"img\/kitten\.jpg\"\/\>/)
    it 'relative paths in mixins resolve correctly', ->
      content2 = fs.readFileSync path.join(test_path, output_folder + '/1/index.html'), 'utf8'
      content2.should.match(/\<img src=\"\.\.\/img\/kitten\.jpg\"\/\>/)