lfa = require '../lib'
path = require 'path'
child_process = require 'child_process'
readdirp = require 'readdirp'
_ = require 'underscore'
fs = require 'fs'

fixturePath = path.join __dirname, 'fixtures'

describe 'LFA', ->
  it 'should be object', ->
    lfa.should.be.type 'object'

  it 'should have lfa.Project', ->
    lfa.Project.should.be.type 'function'

describe 'Basic project', ->
  projPath = path.join fixturePath, 'basic'
  lfaPath = path.join projPath, '.lfa'
  compiledPath = path.join lfaPath, 'build'
  project = null

  it 'should load', (done) ->
    project = new lfa.Project(path.join fixturePath, 'basic')
    project.loaded.then(done.bind(null, null), done)

  it 'should compile', (done) ->
    project.compile().then(done.bind(null, null), done)

  it 'should compile', (done) ->
    project.compile().then(done.bind(null, null), done)

  it 'should have all the files', (done) ->
    readdirp
      root: compiledPath
    , (err, res) ->
      files = _.map res.files, (o) -> o.path
      files.sort()
      files.should.eql [
        'css/master.css',
        'img/kitten.jpg',
        'js/main.js',
        'text/ch01/00.html',
        'text/ch01/01.html',
        'text/ch01/02.html',
        'text/ch02.html',
      ]
      done()

  it 'should compile jade', ->
    compiledFile = "<h1>Chapter 1</h1><p>Looks like everything is working! You can edit this file in text/ch01/00.jade.</p><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"
    fs.readFileSync(path.join compiledPath, 'text', 'ch01', '00.html').toString('utf8').should.equal compiledFile

  it 'should compile stylus', ->
    compiledFile = "body {\n  color: #f00;\n}\n"
    fs.readFileSync(path.join compiledPath, 'css', 'master.css').toString('utf8').should.equal compiledFile

  it 'should compile coffee-script', ->
    compiledFile = "(function() {\n  setTimeout(function() {\n    return console.log('doing something');\n  }, 1000);\n\n}).call(this);\n"
    fs.readFileSync(path.join compiledPath, 'js', 'main.js').toString('utf8').should.equal compiledFile

  it 'should pass through regular files', ->
    compiledFile = fs.readFileSync(path.join fixturePath, 'basic', 'img', 'kitten.jpg').toString('utf8')
    fs.readFileSync(path.join compiledPath, 'img', 'kitten.jpg').toString('utf8').should.equal compiledFile

  it 'should fail when file is malformed', (done) ->
    fs.writeFile path.join(projPath, 'text', 'ch03.jade'), 'h1 Test\n  \t  : errorhere', (err) ->
      if err
        done(err)
        return
      project.compile()
        .then (-> done('Should have errored out')), (-> done())

  after (done) ->
    child_process.exec 'rm -r "' + lfaPath + '"', ->
      child_process.exec 'rm -r "' + path.join(projPath, 'text', 'ch03.jade') + '"', ->
        done()
