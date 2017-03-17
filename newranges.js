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

/*
 * 1. Receieves a new IP-ranges file
 * 2. Parses it into an array of records with hex representation of 128-bit
 *    objects
 * 3. Writes out a file ranges.js containing that array
 * 4. Builds a zipfile containing iioa.js and ranges.js, and dumps it into S3
 * 5. updates the iioa Lambda function with the zipfile
 */

LAMBDA_FUNCTION_NAME = 'isitonaws';
S3_BUCKET_NAME = 'is-it-on-aws'
S3_OBJECT_NAME = 'new-ip.zip';

var async = require('async');
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var rangefinder = require('./lib/rangefinder.js');
var builder = require('./lib/build-array.js');
var zipper = require('./lib/zipper.js');
var rawbody = require('raw-body');
var lambda = new aws.Lambda();
var getter = require('./lib/get-ranges.js');

exports.handler = function newIPRange(event, context) {

  async.waterfall([

    function(next) {
      console.log("Fetch ip-ranges file");
      getter.get(next);
    },
    function(ranges, next) {
      console.log("Build ranges structure");

      // reformat the ip-ranges list
      var sortedRanges = builder.build(ranges, rangefinder);

      // make them into a module body
      var rangesModule = 'module.exports.ranges = ' +
	  JSON.stringify(sortedRanges) + ';';

      next(null, rangesModule);
    },

    function(ranges, next) {
      console.log("Build zip");
      
      // build a zipfile - returned as a Node stream
      var zipStream = zipper.build({
	jsFiles: [ "isitonaws.js" ],
	libFiles: [
	  { name: 'ranges.js', data: ranges },
	  { name: 'rangefinder.js' },
	  { name: 'name-cleaner.js' }
	],
	nodeModules: [ 'ipaddr.js', 'sprintf-js', 'async', 'lodash' ],
	dirs: [ 'data' ]
      });
      next(null, zipStream);
    },

    function(zipStream, next) {
      console.log("Zip to buffer");

      // gather the zipfile stream into a buffer
      rawbody(zipStream, {}, next);
    },

    function(zipBuffer, next) {
      console.log("Buffer to S3");
      

      // write the zipfile into S3.
      // We could update the lambda function directly, but
      //  it's nice to be able to download the zip so you can actually
      //  see the code
      s3.putObject({
	Bucket: S3_BUCKET_NAME,
	Key: S3_OBJECT_NAME,
	Body: zipBuffer
      }, next);
    },

    function(updateLambda, next) {
      var params = {
	FunctionName: LAMBDA_FUNCTION_NAME,
	S3Bucket: S3_BUCKET_NAME,
	S3Key: S3_OBJECT_NAME
      };
      console.log("S3 to Lambda");
      lambda.updateFunctionCode(params, next);
    }
    
  ], function(err) {
    if (err) {
      console.log("ouch! " + err);
      context.fail();
    } else {
      context.succeed("OK");
    }
  });
}
