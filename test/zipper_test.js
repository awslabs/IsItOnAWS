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

var test = require('tape');
var zipper = require('../lib/zipper');
var fs = require('fs');
var rawbody = require('raw-body');
var process = require('process');
var exec = require('child_process').exec;

test('build a basic zip', function(t) {

  // perhaps not obvious - this runs at the root of the project, makes
  //  a zip of the files in the test/ directory, and checks that it can
  //  be unzipped, and that the listing includes this file, zipper_test.js
  
  var stream = zipper.build({
    libFiles: [ { name:'fx.xf', data:'fxcontent' }],
    dirs: [ 'test' ]
  });
  var tmpName = "z" + process.pid + ".zip"
  rawbody(stream, {}, function(err, body) {
    fs.writeFile(tmpName, body, {}, function(err) {
      if (err) {
        t.fail("Error writing file: " + err);
      } else {
        exec("unzip -l " + tmpName, function(error, stdout, stderr) {
          if (error) {
            t.fail("Error from unzip: " + error + " tmpname=" + tmpName);
          }
          if (stderr) {
            t.fail("Unzip stderr: " + stderr + " tmpname=" + tmpName);
          } else {
            t.ok(stdout.match(/zipper_test.js/), "Zip readable, zipper_test present");
            t.ok(stdout.match(/fx.xf/), "Zip readable, fx.xf present");
	    fs.unlink(tmpName, function(problems) {
	      console.log("unlink: " + problems);
	    });
          }
        });
      }
    });
  });
  
  t.end();
});

