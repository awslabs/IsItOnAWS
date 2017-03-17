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
var rangefinder = require('./lib/rangefinder.js');
var ranges = require('./lib/ranges.js');
var cleaner = require('./lib/name-cleaner.js');
var async = require('async');
const dns = require('dns');
var fs = require('fs');

var ANSWER = '<div id="answer"></div>';

exports.handler = function isItOnAWS(event, context) {

  var name = null;
  if (event.queryStringParameters == null ||
      event.queryStringParameters == undefined ||
      event.queryStringParameters.name == undefined ||
      event.queryStringParameters.name == null ||
      event.queryStringParameters.name == "") {
    console.log("NO-OP");
    // no-op, just easier this way
  } else {
    name = cleaner.clean(event.queryStringParameters.name);
  }
  var html = '';
  var ip_searched = null;

  async.waterfall([

    // have to do this first because we need the HTML even if we’re
    //  going to bail out and just show the query page
    function readHTML(next) {
      fs.readFile('./data/index.html', next);
    },

    function decideWhetherToQuery(fileBody, next) {

      html = fileBody.toString();
      if (name) {
	next(null);
      } else {
	next('no-query');
      }
    },
    
    function lookup(next) {
      console.log("Looking for " + name);
      
      if (name.match(/^\d+\.\d+\.\d+\.\d+$/)) {
	console.log("IPV4");
	next(null, name, 4);
      } else if (name.match(/^[0-9a-fA-F:]+$/)) {
	console.log("IPV6");
	next(null, name, 6);
      } else {
	try {
	  console.log("Launch DNS");
	  dns.lookup(name, next);
	} catch (e) {
	  next('dns-failure');
	}
      }
    },
    function find(ip, family, next) {
      console.log("Looking for IP " + ip);
      ip_searched = ip;
      var target = rangefinder.to32HexDigits(ip, (family == 4));
      var range = searchRanges(ranges.ranges, target);
      if (range) {
	console.log("Yes, found it");
	next(null, range);
      } else {
	console.log("Not found");
	next(null, null);
      }
    },
    function makeHTML(range, next) {
      var newPara = '';
      if (range != null) {
	newPara = '<div id="answer">' +
	  '<p>Yes, ' + name + ' (' + ip_searched + ') is apparently on AWS.</p>' +
	  '<table>' +
	  '<tr><td align="right">Region: </td><td align="left">' + range.region + '</td></tr>' +
	  '<tr><td align="right">Service: </td><td align="left">' + range.service + '</td></tr>' +
	  '<tr><td align="right">CIDR: </td><td align="left">' + range.cidr + '</td></tr>' +
	  '</table>'
      } else {
	newPara = '<div class="answer"><p>No, ' + name + ' (' + ip_searched + ') is apparently not on AWS.</p></div>';
      }
      var newH = html.replace(ANSWER, newPara);
      next(null, newH);
    }
  ], function(err, result) {
    
    if (err) {
      // no-query means that we’re just displaying the page
      if (err == 'no-query') {
	console.log("NoQuery");
	context.succeed({
	  "statusCode": 200,
	  "headers": { "Content-type": "text/html" },
	  "body": html
	});
      } else {
	
	// something really went wrong.  Apparently, the only thing
	//  that can cause this is a DNS botch.
	newPara = '<div id="answer">' +
	  '<p>That doesn&rsquo;t seem to be a valid hostname. ' +
	  'Please try again.</p>';

	console.log("ouch! " + err);
	context.succeed({
	  "statusCode": 200,
	  "headers": { "Content-type": "text/html" },
	  "body": html.replace(ANSWER, newPara)
	});
      }
    } else {

      // if we get here we have found a IP range to display in the output
      context.succeed({
	"statusCode": 200,
	"headers": { "Content-type": "text/html" },
	"body": result
      });
    }
  });
}

function searchRanges(ranges, name) {
  var low = -1;
  var high = ranges.length;

  while (high - low > 1) {
    var probe = (high + low) >>> 1;
    if (ranges[probe].range.min > name) {
      high = probe;
    } else {
      low = probe;
    }
  }

  if (low == -1) {
    return null
  }
  var record = ranges[low];
  if (name < record.range.min || name > record.range.max) {
    return null;
  }
  return record;
}
