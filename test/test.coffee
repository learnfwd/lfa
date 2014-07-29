lfa = require '../lib'
path = require 'path'

fixturePath = path.join __dirname, 'fixtures'

describe 'LFA', ->
  it 'should be object', ->
    lfa.should.be.type 'object'

  it 'should have Project', ->
    lfa.Project.should.be.type 'function'

  it 'should load project', (done) ->
    proj = new lfa.Project(path.join fixturePath, 'basic')
    proj.loaded.then(done.bind(null, null), done)

  describe 'basic project', ->
    project = null
    before (done) ->
      project = new lfa.Project(path.join fixturePath, 'basic')
      project.loaded.then(done.bind(null, null), done)

    describe 'loaded', ->
      it 'should compile', (done) ->
        project.compile().then(done.bind(null, null), done)
