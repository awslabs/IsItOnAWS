/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"). You may 
 * not use this file except in compliance with the License. A copy of the 
 * License is located at
 * 
 *     http://aws.amazon.com/apache2.0/
 * 
 * or in the "license" file accompanying this file. This file is distributed 
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
 * express or implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */

var jszip = require('jszip');
var fs = require('fs');

/**
 * Produce a zip file containing the indicated files
 *  js is a list of top-level files
 *  libJs = a list of records with name and content of files that
 *   should go in ./lib
 *  dirs is a list of dirs to add recursively
 *  node_modules is a list of modules, a.k.a. top-level dirs in ./node_modules
 *   (because you might not want to include them all)
 */
module.exports.build = function(toZip) {

  var zip = new jszip();

  if (toZip.jsFiles) {
    toZip.jsFiles.forEach(function(f) { zip.file(f, fs.readFileSync('./' + f)) });
  }
  if (toZip.libFiles) {
    var lib = zip.folder('lib');
    toZip.libFiles.forEach(function(f) {
      if (f.data) {
	lib.file(f.name, f.data);
      } else {
	lib.file(f.name, fs.readFileSync('./lib/' + f.name));
      }
    });
  }
  if (toZip.nodeModules) {
    toZip.nodeModules.forEach(function(d) { readDir(zip, './node_modules/' + d); });
  }
  if (toZip.dirs) {
    toZip.dirs.forEach(function(d) { readDir(zip, './' + d); });
  }


  return zip.generateNodeStream();
};

function readDir(zip, d) {
  var folder = zip.folder(d);
  fs.readdirSync(d).forEach(function(f) {
    // dodge emacs dung
    if (!f.match(/\~$/)) { 
      var path = d + '/' + f;
      if (fs.statSync(path).isDirectory()) {
        readDir(zip, path);
      } else {
	folder.file(f, fs.readFileSync(path));
      }
    }
  });
}

