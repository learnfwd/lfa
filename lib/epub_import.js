var fs = require('fs'),
    W = require('when'),
    nodefn = require('when/node'),
    colors = require('colors'),
    util = require('util'),
    path = require('path'),
    os = require('os'),
    rimraf = require('rimraf'),
    xml2js = require('xml2js'),
    xmldoc = require('xmldoc'),
    assert = require('assert'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    yamljs = require('yamljs'),
    unzip = require('unzip');

module.exports = {};

function debugLog(data, color) {
  color = color || 'grey';
  if(module.exports.debug) {
    console.log(data[color]);
  }
}

module.exports.run = function(from, to) {
  from = path.resolve(from);
  to = path.resolve(to);
  return nodefn.call(fs.stat, from).then(function (stat) {
    if (stat.isDirectory()) {
      return importEpubDir(from, to);
    } else {
      var extractDir = path.join(os.tmpdir(), 'lfa-' + (new Date()).getTime());
      return W.promise(function(resolve, reject) {
        debugLog('extracting to ' + extractDir);
        process.stdout.write('extracting epub...'.grey);
        fs.createReadStream(from)
          .pipe(unzip.Extract({ path: extractDir }))
          .on('close', function() {
            process.stdout.write(' done\n'.green);
            resolve(importEpubDir(extractDir, to));
          })
          .on('error', function(err) {
            reject(err);
          });
        })
      .then(function() {
        process.stdout.write('cleaning up...'.grey);
        return nodefn.call(rimraf, extractDir).then(function() {
          process.stdout.write(' done\n'.green);
        });
      });
    }
  }).then(function() {
    process.stdout.write('done!\n'.green);
  });
};

function importEpubDir(from, to) {

  function parseRootFile(data) {
      process.stdout.write('parsing root file\n'.grey);
      var xml = new xmldoc.XmlDocument(data.toString());

      var files = _.map(xml.childNamed('manifest').children, function(o) { return o.attr; });
      var spine = xml.childNamed('spine');
      var spineIds = _.map(spine.children, function(o) { return o.attr.idref; });
      var tocId = spine.attr.toc;

      var filesById = {};
      var views = [];
      var assets = [];

      _.each(files, function(o) {
        filesById[o.id] = o;
        var mime = o['media-type'];
        if (mime.match(/html/)) {
          views.push(o);
        } else if (mime !== 'application/x-dtbncx+xml') {
          assets.push(o);
        }
      });

      function digitsForArray(v) {
        var digits = 0;
        var factor = 1;
        var n = v.length;
        while (n >= factor) {
          factor *= 10;
          digits++;
        }
        return (new Array(digits + 1)).join('0');
      }

      function pad(padding, nr) {
        var nrs = nr.toString();
        return padding.substring(0, padding.length - nrs.length) + nrs;
      }

      // Rename views
      var index = 0;
      var digits = digitsForArray(views);

      _.each(spineIds, function(id) {
        var f = filesById[id];
        f.target = 'text/ch' + pad(digits, index++) + '.html'
      });
      _.each(views, function(f) {
        if (!f.target) {
          f.target = 'text/ch' + pad(digits, index++) + '_hide.html';
        }
      });

      var dirs = { text: true };

      // Rename assets
      _.each(assets, function(f) {
        f.target = 'assets/' + f.href;
        dirs[f.target.match(/^.*\//)[0]] = true;
      });

      process.stdout.write('creating directories...'.grey);

      function makeConfig() {
        var meta = {};

        _.each(xml.childNamed('metadata').children, function(o) { 
          if (o.name === 'dc:title') {
            if (!meta.book_title) {
              meta.book_title = o.val;
            }
          } else if (o.name === 'dc:creator') {
            if (!meta.book_author) {
              meta.book_author = o.val;
            }
          } else if (o.name === 'dc:description') {
            if (!meta.book_description) {
              meta.book_description = o.val;
            }
          }
        });

        var data = yamljs.stringify(meta);
        return nodefn.call(fs.writeFile, path.join(to, 'config.yml'), data);
      }

      function copyAssets() {
        console.log('copying assets'.grey);
        return W.all(_.map(assets, function(f) {
          return W.promise(function(resolve, reject) {
            debugLog('copying ' + f.href);
            fs.createReadStream(path.join(from, f.href))
              .pipe(fs.createWriteStream(path.join(to, f.target)))
              .on('close', resolve)
              .on('error', reject);
          });
        }));
      }

      function compileViews() {
        console.log('compiling views'.grey);
        return W.all(_.map(views, function(f) {
          return W.promise(function(resolve, reject) {
            debugLog('compiling ' + f.href);
            fs.createReadStream(path.join(from, f.href))
              .pipe(fs.createWriteStream(path.join(to, f.target)))
              .on('close', resolve)
              .on('error', reject);
          });
        }));
      }

      return W.all(_.map(_.keys(dirs), function(dir) {
        return nodefn.call(mkdirp, path.join(to, dir));
      })).then(function() {
        process.stdout.write(' done\n'.green);
      }).then(function() {
        // Do all of this concurrently
        return W.all([makeConfig(), copyAssets(), compileViews()]);
      });
  }

  function parseContainerXML(data) {
      process.stdout.write('parsing container.xml\n'.grey);
      return nodefn.call(xml2js.parseString, data.toString())
        .then(function(xml) {
          var content = null;
          var rootFiles = xml.container.rootfiles[0].rootfile;
          for (var i = 0, n = rootFiles.length; i<n; i++) {
            var file = rootFiles[i];
            if (file.$['media-type'] === 'application/oebps-package+xml') {
              content = file.$['full-path'];
              break;
            }
          }
          assert(content !== null, 'no matching root file in container.xml');
          return nodefn.call(fs.readFile, path.join(from, content)).then(parseRootFile);
        });
  }

  function fetchContainerXML() {
    return nodefn.call(fs.stat, path.join(from, 'META-INF', 'encryption.xml')).then(function() {
      process.stdout.write('warning:'.red + ' encryption.xml detected. this tool doesn\'t support encrypted EPUBs\n');
    }).catch(function() {
      return nodefn.call(fs.readFile, path.join(from, 'META-INF', 'container.xml'))
        .then(parseContainerXML);
    });
  }

  return fetchContainerXML();
}
