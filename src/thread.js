var child_process = require('child_process');
var fs = require('fs');
var JSONStream = require('JSONStream');

var Thread = {};

// Run this to fork a child process that quits when the parent quits
Thread.fork = function fork(moduleName, opts) {
  opts = opts || {};
  opts.silent = opts.silent || false;

  var args = process.execArgv.slice(0);
  args.push(moduleName);
  if (opts.data) {
    args.push(JSON.stringify(opts.data));
  }

  var cp = child_process.spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    detached: false,
    stdio: [ 'pipe', 'pipe', 'pipe', 'pipe'/*ipc*/, 'pipe'/*polling*/ ],
  });

  // Forward stderr and stdout
  if (!opts.silent) {
    cp.stdio[1].pipe(process.stdout);
    cp.stdio[2].pipe(process.stderr);
  }

  // Set up our own async IPC
  var ipc = cp.stdio[3];
  ipc.write('{"messages":[');
  cp.send = function (obj, cb) {
    ipc.write(JSON.stringify(obj) + ',', cb);
  };

  var parser = JSONStream.parse('messages.*');
  parser.on('data', function (data) {
    cp.emit('message', data);
  });
  ipc.pipe(parser);

  // Discard the polling data
  cp.stdio[4].on('data', function () {});

  // Immediately kill the child process when the parent quits
  function killChild() {
    if (cp) {
      cp.kill('SIGTERM');
      cp = null;
    }
  }

  function exitParent() {
    process.exit();
  }

  process.on('SIGTERM', exitParent);
  process.on('SIGHUP', exitParent);
  process.on('exit', killChild);

  cp.on('exit', function () {
    cp = null;
    process.removeListener('SIGTERM', exitParent);
    process.removeListener('SIGHUP', exitParent);
    process.removeListener('exit', killChild);
  });

  return cp;
};

// Run this in the child process
Thread.connectParent = function connectParent() {

  // Poll parent process to check if it got SIGKILL-ed or it crashed
  var pipe = fs.createWriteStream(null, { fd: 4 });
  setInterval(function () {
    pipe.write('A', function (err) {
      if (err) { process.exit(0); }
    });
  }, 1000);

  // Set up async IPC
  var ipcRead = fs.createReadStream(null, { fd: 3 });
  var parser = JSONStream.parse('messages.*');
  parser.on('data', function (data) {
    process.emit('message', data);
  });
  ipcRead.pipe(parser);

  var ipcWrite = fs.createWriteStream(null, { fd: 3 });
  ipcWrite.write('{"messages":[');
  process.send = function (obj, cb) {
    ipcWrite.write(JSON.stringify(obj) + ',', cb);
  };
};

module.exports = Thread;
