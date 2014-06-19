var fs = require('fs'),
    W = require('when'),
    nodefn = require('when/node'),
    colors = require('colors'),
    util = require('util'),
    path = require('path'),
    os = require('os'),
    rimraf = require('rimraf'),
    xmldoc = require('xmldoc'),
    assert = require('assert'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    yaml = require('js-yaml'),
    jsdom = require('jsdom'),
    html2jade = require('html2jade'),
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
  var rootFilePwd = '';

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
      if (digits < 2)
        digits = 2;
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

    // Rename assets
    _.each(assets, function(f) {
      f.target = 'assets/' + f.href;
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
                var path = el.getAttribute(attr);
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
                      resolvedPath = resolvedPath; // + '/' + splitResolvedPath[1];

                    }
                  }
                }
                el.setAttribute(attr, resolvedPath);
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
      return nodefn.call(fs.readFile, path.join(from, rootFilePwd, filesById[tocId].href)).then(function(data) {
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
            var url = content.attr.src.split('#');
            if (url) {
              var file = renameMap[url[0]];
              if (file) {
                tocItem.url = file.viewUrl; // + '/' + url[1]
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
          fs.createReadStream(path.join(from, rootFilePwd, f.href))
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
        return nodefn.call(fs.readFile, path.join(from, rootFilePwd, f.href))
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
    var v = content.split('/');
    v.pop();
    rootFilePwd = v.length ? v.join('/') + '/' : '';
    return nodefn.call(fs.readFile, path.join(from, content)).then(parseRootFile);
  }

  function fetchContainerXML() {
    return nodefn.call(fs.stat, path.join(from, 'META-INF', 'encryption.xml')).then(function() {
      process.stdout.write('warning:'.red + ' encryption.xml detected. this tool doesn\'t support encrypted EPUBs\n');
    }).catch(function(){
    }).then(function() {
      return nodefn.call(fs.readFile, path.join(from, 'META-INF', 'container.xml'))
        .then(parseContainerXML);
    });
  }

  return fetchContainerXML();
}
