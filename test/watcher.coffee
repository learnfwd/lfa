lfa = require '../lib'
path = require 'path'
child_process = require 'child_process'
_ = require 'underscore'
fs = require 'fs'

fixturePath = path.join __dirname, 'fixtures'

describe 'Watcher', ->
  projPath = path.join fixturePath, 'watcher'
  lfaPath = path.join projPath, '.lfa'
  compiledPath = path.join lfaPath, 'build'
  child = null

  before (done) ->
    child_process.exec 'cp -r "' + path.join(fixturePath, 'basic') + '" "' + projPath + '"', (err) ->
      if err
        done(err)
        return
      child = child_process.fork(__dirname + '/watcher-fork.conf', [projPath])
      unbind = -> child.removeListener('message', handler)
      handler = (msg) ->
        switch msg.msg
          when 'load-done'
            unbind()
            done()
          when 'load-error'
            unbind()
            done(JSON.stringify(msg.err))
      child.on 'message', handler

  after (done) ->
    child.kill()
    child_process.exec('rm -r "' + projPath + '"', done.bind(null, null))


  it 'should compile', (done) ->
    unbind = -> child.removeListener('message', handler)
    handler = (msg) ->
      switch msg.msg
        when 'compile-done'
          unbind()
          done()
        when 'compile-error'
          unbind()
          done(JSON.stringify(msg.err))
    child.on 'message', handler

  it 'should start server', (done) ->
    unbind = -> child.removeListener('message', handler)
    handler = (msg) ->
      switch msg.msg
        when 'server-done'
          unbind()
          done()
        when 'server-error'
          unbind()
          done(JSON.stringify(msg.err))
    child.on 'message', handler

  it 'should start watcher', (done) ->
    unbind = -> child.removeListener('message', handler)
    handler = (msg) ->
      switch msg.msg
        when 'watcher-done'
          unbind()
          done()
        when 'watcher-error'
          unbind()
          done(JSON.stringify(msg.err))
    child.on 'message', handler

  it 'should recompile when file changed', (done) ->
    timer = 'pre-timer'
    fs.writeFile path.join(projPath, 'text', 'ch02.jade'), 'h1 Testing', (err) ->
      if err
        unbind()
        done(err)
        return
      timer = setTimeout ->
        return if not timer
        unbind()
        done('Recompilation did not start')
      , 100000
    unbind = -> child.removeListener('message', handler)
    handler = (msg) ->
      switch msg.msg
        when 'compile-start'
          clearTimeout timer if timer is not 'pre-timer'
          timer = null
        when 'compile-done'
          unbind()
          done()
        when 'compile-error'
          unbind()
          done(JSON.stringify(msg.err))
    child.on 'message', handler

