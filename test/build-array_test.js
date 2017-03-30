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
var rf = require('../lib/rangefinder.js');
var builder = require('../lib/build-array.js');

test('extract and sort ranges', function(t) {

  var data = `{
    "syncToken": "1480979949",
    "createDate": "2016-12-05-23-19-09",
    "prefixes": [
      {
	"ip_prefix": "216.137.32.0/19",
	"region": "should be second",
	"service": "CLOUDFRONT"
      },
      {
	"ip_prefix": "13.32.0.0/15",
	"region": "should be first",
	"service": "AMAZON"
      }
    ],
    "ipv6_prefixes": [
      {
	"ipv6_prefix": "2a05:d050:4040::/44",
	"region": "should be last",
	"service": "AMAZON"
      },
      {
	"ipv6_prefix": "2a05:d018:fff:f800::/53",
	"region": "should be fourth",
	"service": "ROUTE53_HEALTHCHECKS"
      },
      {
	"ipv6_prefix": "2400:6500:0:7000::/56",
	"region": "should be third",
	"service": "AMAZON"
      }
    ]
  } `;

  var desiredRegions = [
    "should be first", "should be second", "should be third",
    "should be fourth", "should be last"
  ];

  var j = JSON.parse(data);
  var output = builder.build(j, rf);
  for (var i = 0; i < output.length; i++) {
    t.equal(output[i].region, desiredRegions[i], "Record [" + i + "]");
  }

  t.end();
  
});


test('handle overlapping ranges', function(t) {

  var data = `{
    "syncToken": "1480979949",
    "createDate": "2016-12-05-23-19-09",
    "prefixes": [
      {
	"ip_prefix": "34.192.0.0/12",
	"region": "us-east-1",
	"service": "EC2"
      },
      {
	"ip_prefix": "34.195.252.0/24",
	"region": "us-east-1",
	"service": "CLOUDFRONT"
      }
    ],
    "ipv6_prefixes": [
    ]
  } `;

  var j = JSON.parse(data);
  var output = builder.build(j, rf);
  t.equal(output.length, 1);
  t.end();
});
