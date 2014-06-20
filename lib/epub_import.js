var fs = require('fs'),
    W = require('when'),
    nodefn = require('when/node'),
    path = require('path'),
    os = require('os'),
    rimraf = require('rimraf'),
    xmldoc = require('xmldoc'),
    assert = require('assert'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    yaml = require('js-yaml'),
    jsdom = require('jsdom'),
    readdirp = require('readdirp'),
    html2jade = require('html2jade'),
    unzip = require('unzip');
require('colors');

module.exports = {};

function _debugLog(opts) {
  if (opts.debug) {
    return function(data, color) {
      color = color || 'grey';
      console.log(data[color]);
    };
  } else {
    return function() {};
  }
}

module.exports.run = function(from, to, opts) {
  from = path.resolve(from);
  to = path.resolve(to);
  opts = opts || {};
  var debugLog = _debugLog(opts);

  return nodefn.call(fs.stat, from).then(function (stat) {
    if (stat.isDirectory()) {
      return importEpubDir(from, to, opts);
    } else {
      var extractDir = path.join(os.tmpdir(), 'lfa-' + (new Date()).getTime());
      return W.promise(function(resolve, reject) {
        debugLog('extracting to ' + extractDir);
        process.stdout.write('extracting epub...'.grey);
        fs.createReadStream(from)
          .pipe(unzip.Extract({ path: extractDir }))
          .on('close', function() {
            process.stdout.write(' done\n'.green);
            resolve(importEpubDir(extractDir, to, opts));
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

function importEpubDir(from, to, options) {
  var debugLog = _debugLog(options);

  function parseRootFile(parseArgs) {
    var data = parseArgs[0];
    var rootFilePath = parseArgs[1];
    var fileList = parseArgs[2];

    // Getting the path PWD
    var rootFileSplit = rootFilePath.split('/');
    rootFileSplit.pop();
    var rootFilePwd = rootFileSplit.length ? rootFileSplit.join('/') + '/' : '';

    process.stdout.write('parsing root file\n'.grey);

    var xml = new xmldoc.XmlDocument(data.toString());

    var files = _.map(xml.childNamed('manifest').children, function(o) { 
      var r = o.attr;
      r.href = rootFilePwd + decodeURI(r.href);
      return r;
    });
    var spine = xml.childNamed('spine');
    var spineIds = _.map(spine.children, function(o) { return o.attr.idref; });
    var tocId = spine.attr.toc;

    // Detect un-manifested files
    
    var fileMap = {};
    _.each(fileList.files, function(f) {
      fileMap[f.path] = true;
    });
    _.each(files, function(f) {
      fileMap[f.href] = false;
    });
    fileMap[rootFilePath] = false;

    var undeclaredFiles = [];
    _.each(fileMap, function (value, key) {
      if (!value) { return; }
      process.stdout.write('warning:'.yellow + ' file not declared in OPF manifest: \"' + key + '\"\n');
      undeclaredFiles.push(key);
    });

    if (undeclaredFiles.length && !options.copyUndeclared) {
      process.stdout.write('info:'.blue + ' run lfa again with --copy-undeclared to include them\n');
    }

    if (options.copyUndeclared) {
      _.each(undeclaredFiles, function(o) {
        var mime;
        if (o.match(/.xhtml$/)) { 
          mime = 'application/xhtml+xml';
        } else if (o.match(/.html$/)) { 
          mime = 'application/html';
        } else {
          mime = 'text/plain';
        }
        files.push({ 
          href: o,
          'media-type': mime
        });
      });
    }

    // Sort files

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
      if (digits < 2) {
        digits = 2;
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
      if (!f.target) {
        f.viewUrl = 'ch' + pad(digits, index++);
        f.target = 'text/' + f.viewUrl + '.jade';
      }
    });
    _.each(views, function(f) {
      if (!f.target) {
        f.viewUrl = 'ch' + pad(digits, index++) + '_hide';
        f.target = 'text/' + f.viewUrl + '.jade';
      }
    });

    var dirs = { text: true, css: true };

    // Drop some common path component
    function commonPathComponent(v) {
      var common = null;
      function dropComponent() {
        var matches = common.replace(/\/$/).match(/^.*\//);
        if (matches) {
          common = matches[0];
          return false;
        } else {
          common = '';
          return true;
        }
      }

      for (var i = 0, n = v.length; i < n; i++) {
        var f = v[i];
        var empty = false;
        if (!common) {
          common = f.href;
          empty = dropComponent(common);
        } else {
          while (!empty && f.href.substr(0, common.length) !== common) {
            empty = dropComponent(common);
          }
        }
        if (empty) {
          break;
        }
      }

      return common || '';
    }

    // Rename assets
    var assetsCommon = commonPathComponent(assets);

    _.each(assets, function(f) {
      f.target = 'assets/' + f.href.substr(assetsCommon.length);
      dirs[f.target.match(/^.*\//)[0]] = true;
    });

    // Create rename map
    var renameMap = {};
    _.each(files, function(f) {
      if (f.href) {
        renameMap[f.href] = f;
      }
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

      var data = yaml.safeDump(meta);
      return nodefn.call(fs.writeFile, path.join(to, 'config.yml'), data);
    }

    function makeStyl() {
      var data = 'lfa-framework()\n';
      return nodefn.call(fs.writeFile, path.join(to, 'css', 'master.styl'), data);
    }

    function compileHTML(html, f) {
      return W.promise(function(resolve, reject) {
        jsdom.env({
          html: html,
          features: {
            FetchExternalResources: false,
            ProcessExternalResources: false,
          },
          done: function (err, window) {
            var document = window.document;
            var pwd = f.href.split('/');
            pwd.pop();
            (function dfs(el) {
              function fixAttr(attr) {
                var path = decodeURI(el.getAttribute(attr));
                if (!path) { return; }

                // Resolving relative paths
                var resolvedPath = pwd.slice(0);
                var splitPath = path.split('/');
                for (var i = 0, n = splitPath.length; i < n; i++) {
                  var pc = splitPath[i];
                  if (pc === '..') {
                    resolvedPath.pop();
                  } else {
                    resolvedPath.push(pc);
                  }
                }

                // Replace with renamed file
                resolvedPath = resolvedPath.join('/');
                var splitResolvedPath = resolvedPath.split('#');
                if (splitResolvedPath.length) {
                  var file = renameMap[splitResolvedPath[0]];
                  if (file) {
                    if (file.viewUrl) {
                      resolvedPath = '#book/' + file.viewUrl;
                    } else if (file.target) {
                      resolvedPath = file.target;
                    }
                    if (splitResolvedPath.length > 1) {
                      resolvedPath = resolvedPath + '/' + splitResolvedPath[1];

                    }
                  }
                }
                el.setAttribute(attr, encodeURI(resolvedPath));
              }

              if (el.nodeType === 1) {
                fixAttr('src');
                fixAttr('href');
                fixAttr('xlink:href');
              }

              for (var i = 0, v = el.children, n = v.length; i < n; i++) {
                dfs(v[i]);
              }
            })(document);

            var style = '';
            var links = document.querySelectorAll('link[type="text/css"]');
            var body = document.getElementsByTagName('body')[0] || document;
            for (var i = 0, n = links.length; i < n; i++) {
              var el = links[i];
              style += '<style type=\"text/css\">@import url(\"' + el.href + '\");</style>';
              el.parentNode.removeChild(el);
            }

            var htmlOut = '<article><section>'+style+body.innerHTML+'</section></article>';
            html2jade.convertHtml(htmlOut, {bodyless:true}, function (err, jade) {
              resolve(jade);
            });
          },
        });
      });
    }

    function buildSpine() {
      console.log('building spine'.grey);
      var spine = _.map(spineIds, function(id) { return filesById[id].viewUrl; });
      return nodefn.call(fs.writeFile, path.join(to, 'spine.js'), JSON.stringify(spine, null, 2));
    }

    function buildTOC() {
      console.log('building table of contents'.grey);
      return nodefn.call(fs.readFile, path.join(from, filesById[tocId].href)).then(function(data) {
        var xml = new xmldoc.XmlDocument(data.toString());
        var navMap = xml.childNamed('navMap');
        var toc = (function dfs(nodes) {
          var toc = [];
          for (var i = 0, n = nodes.length; i < n; i++) {
            var node = nodes[i];
            if (node.name !== 'navPoint') { continue; }

            var tocItem = { locals: {} };
            
            var navLabel = node.childNamed('navLabel');
            if (navLabel) {
              var navText = navLabel.childNamed('text');
              if (navText) {
                tocItem.locals.title = navText.val;
              }
            }

            var content = node.childNamed('content');
            var url = decodeURI(rootFilePwd + content.attr.src).split('#');
            if (url) {
              var file = renameMap[url[0]];
              if (file) {
                tocItem.url = file.viewUrl + '/' + url[1];
              }
            }

            tocItem.children = dfs(node.children);
            toc.push(tocItem);
          }
          return toc;
        })(navMap.children);

        return nodefn.call(fs.writeFile, path.join(to, 'toc.js'), JSON.stringify(toc, null, 2));
      });
    }

    function copyAssets() {
      console.log('copying assets'.grey);
      return W.all(_.map(assets, function(f) {
        return W.promise(function(resolve, reject) {
          fs.createReadStream(path.join(from, f.href))
            .pipe(fs.createWriteStream(path.join(to, f.target)))
            .on('close', resolve)
            .on('error', reject);
        }).then(function() {
          debugLog('copied ' + f.href);
        });
      }));
    }

    function compileViews() {
      console.log('compiling views'.grey);
      return W.all(_.map(views, function(f) {
        return nodefn.call(fs.readFile, path.join(from, f.href))
          .then(function(data) { return compileHTML(data, f); })
          .then(function(data) {
            return nodefn.call(fs.writeFile, path.join(to, f.target), data);
          })
          .then(function() {
            debugLog('compiled ' + f.href);
          });
      }));
    }

    return W.all(_.map(_.keys(dirs), function(dir) {
      return nodefn.call(mkdirp, path.join(to, dir));
    })).then(function() {
      process.stdout.write(' done\n'.green);
    }).then(function() {
      // Do all of this concurrently
      return W.all([makeConfig(), makeStyl(), buildTOC(), buildSpine(), copyAssets(), compileViews()]);
    });
  }

  function parseContainerXML(data) {
    process.stdout.write('parsing container.xml\n'.grey);
    var xml = new xmldoc.XmlDocument(data.toString());

    var content = null;
    var rootFiles = xml.childNamed('rootfiles').children;
    for (var i = 0, n = rootFiles.length; i<n; i++) {
      var file = rootFiles[i];
      if (file.attr['media-type'] === 'application/oebps-package+xml') {
        content = file.attr['full-path'];
        break;
      }
    }
    assert(content !== null, 'no matching root file in container.xml');
    return nodefn.call(fs.readFile, path.join(from, content)).then(function(xml) {
      // Wait for the file list to be compiled
      return W.all([xml, content, listAllFilesPromise]); 
    }).then(parseRootFile);
  }

  function fetchContainerXML() {
    return nodefn.call(fs.stat, path.join(from, 'META-INF', 'encryption.xml')).then(function() {
      process.stdout.write('warning:'.yellow + ' encryption.xml detected. this tool doesn\'t support encrypted EPUBs\n');
    }).catch(function(){
    }).then(function() {
      return nodefn.call(fs.readFile, path.join(from, 'META-INF', 'container.xml'))
        .then(parseContainerXML);
    });
  }

  var listAllFilesPromise = nodefn.call(readdirp, {
    root: from,
    directoryFilter: ['!META-INF', '!.*'],
    fileFilter: ['!.*', '!iTunesMetadata.plist', '!mimetype']
  });

  return fetchContainerXML();
}
