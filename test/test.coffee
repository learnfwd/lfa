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
      fs.readdirSync(path.join(basic_root, output_folder)).should.have.lengthOf(4)

    it 'should minify javascript', ->
      js_content = fs.readFileSync path.join(basic_root, output_folder + '/js/templates/main.js'), 'utf8'
      js_content.should.not.match /\n/
  
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
          'config.yml'
          'text'
          'text/ch01'
          'text/ch01/00.jade'
          'text/ch01/01.jade'
          'text/ch01/02.jade'
          'text/ch02.jade'
          'css'
          'css/master.styl'
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
          fs.readdirSync(path.join(basic_root, output_folder)).should.have.lengthOf(4)
          shell.rm '-rf', path.join(basic_root, output_folder)
          done()
      it 'not include component library', (done) ->
        run "cd \"#{basic_root}\"; ../../bin/lfa compile --no-compress --components=false", ->
          fs.readdirSync(path.join(basic_root, output_folder)).should.have.lengthOf(3)
          shell.rm '-rf', path.join(basic_root, output_folder)
          done()
      it 'still not include component library when config.yml says so', (done) ->
        path_no_comp = path.join(root, 'no-components');
        run "cd \"#{path_no_comp}\"; ../../bin/lfa compile --no-compress", ->
          fs.readdirSync(path.join(path_no_comp, output_folder)).should.have.lengthOf(3)
          shell.rm '-rf', path.join(path_no_comp, output_folder)
          done()

describe 'config file', ->
  test_path = path.join root, './no-config'

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
      done()
  
  after ->
    shell.rm '-rf', path.join test_path, output_folder
  
  it 'needs to exist for a project to compile', ->
    fs.existsSync(path.join(test_path, output_folder + '/leavemealone')).should.not.be.ok

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

  it 'should compile without closures when specified in config.yml', (done) ->
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

describe 'precompiled templates', ->
  test_path = path.join root, './precompile'

  before (done) ->
    run "cd #{test_path}; ../../bin/lfa compile --no-compress --components=false", ->
      done()

  it 'precompiles templates', ->
    fs.existsSync(path.join(test_path, output_folder + '/js/templates/')).should.be.ok
    require_content = fs.readFileSync path.join(test_path, output_folder + '/js/templates/sample.js'), 'utf8'
    require_content.should.match(/\<p\>hello world\<\/p\>/)
    shell.rm '-rf', path.join(test_path, output_folder)

describe 'table of contents', ->
  test_path = path.join root, './toc'

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
      done()
  
  after ->
    shell.rm '-rf', path.join(test_path, output_folder)
  
  describe 'can be generated with proper structure', ->
    it 'all pages should have all the other pages', ->
      content = fs.readFileSync path.join(test_path, output_folder + '/js/searchjson.js'), 'utf8'
      content.should.match(/Uses of common metals/)
      content.should.match(/Uses of common non-metals/)
      content.should.match(/You have learned/)
      content.should.match(/Corrosion of metals/)

describe 'mixins', ->
  test_path = path.join root, './project-mixins'

  before (done) ->
    run "cd \"#{test_path}\"; ../../bin/lfa compile --no-compress --components=false", ->
      done()
  
  after ->
    shell.rm '-rf', path.join(test_path, output_folder)
  
  describe 'projects can have their own special mixins', ->
    it 'can call custom_mixin to output lorem ipsum', ->
      content = fs.readFileSync path.join(test_path, output_folder + '/js/templates/mixins.js'), 'utf8'
      content.should.match(/Customus mixinus dolor/)
      
