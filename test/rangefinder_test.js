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

test('Looking for correct ranges', function(t) {

  var ipv4_addresses = [
    "13.32.0.0/15", 
    "27.0.0.0/22",
    "52.76.128.0/17",
    "34.192.0.0/12"
  ];

  var ipv4_byte_arrays = [
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 0x0d, 0x20, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 27, 0, 0, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 52, 76, 128, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 34, 192, 0, 0]
  ];

  var ipv4_hex_strings = [
    "00000000000000000000ffff0d200000",
    "00000000000000000000ffff1b000000",
    "00000000000000000000ffff344c8000",
    "00000000000000000000ffff22c00000"
  ];

  var ipv6_addresses = [
    "2400:6500:ff00::36fb:1f80/122",
    "2600:9000::/28",
    "2600:1f11::/36",
    "2600:1f14::/35"
  ];

  var ipv6_byte_arrays = [
    [ 0x24, 0, 0x65, 0, 0xff, 0, 0, 0, 0, 0, 0, 0, 0x36, 0xfb, 0x1f, 0x80 ],
    [ 0x26, 0, 0x90, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [ 0x26, 0, 0x1f, 0x11, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [ 0x26, 0, 0x1f, 0x14, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ]
  ];

  var ipv6_hex_strings = [
    "24006500ff0000000000000036fb1f80",
    "26009000000000000000000000000000",
    "26001f11000000000000000000000000",
    "26001f14000000000000000000000000"
  ];

  var ipv4_ranges = [
    { min: "00000000000000000000ffff0d200000",
      max: "00000000000000000000ffff0d21ffff" },
    { min: "00000000000000000000ffff1b000000",
      max: "00000000000000000000ffff1b0003ff" },
    { min: "00000000000000000000ffff344c8000",
      max: "00000000000000000000ffff344cffff" },
    { min: "00000000000000000000ffff22c00000",
      max: "00000000000000000000ffff22cfffff" }
  ];

  var ipv6_ranges = [
    { min: "24006500ff0000000000000036fb1f80",
      max: "24006500ff0000000000000036fb1fbf" },
    { min: "26009000000000000000000000000000",
      max: "2600900fffffffffffffffffffffffff" },
    { min: "26001f11000000000000000000000000",
      max: "26001f110fffffffffffffffffffffff" },
    { min: "26001f14000000000000000000000000",
      max: "26001f141fffffffffffffffffffffff" }
  ];

  for (var i = 0; i < ipv4_addresses.length; i++) {
    var ip = ipv4_addresses[i].split('/')[0];
    t.deepEqual(rf.to16Bytes(ip, true), ipv4_byte_arrays[i],
		"IPV4 bytes[" + i + "]");
  }
  for (var i = 0; i < ipv4_addresses.length; i++) {
    var ip = ipv4_addresses[i].split('/')[0];
    t.equal(rf.to32HexDigits(ip, true), ipv4_hex_strings[i],
		"IPV4 hex[" + i + "]");
  }
  for (var i = 0; i < ipv4_addresses.length; i++) {
    var range = rf.find(ipv4_addresses[i], true);
    t.deepEqual(range, ipv4_ranges[i],
		"IPV4 ranges[" + i + "]");
  }
  for (var i = 0; i < ipv6_addresses.length; i++) {
    var ip = ipv6_addresses[i].split('/')[0];
    t.deepEqual(rf.to16Bytes(ip, false), ipv6_byte_arrays[i],
		"IPV6 bytes[" + i + "]");
  }
  for (var i = 0; i < ipv6_addresses.length; i++) {
    var ip = ipv6_addresses[i].split('/')[0];
    t.equal(rf.to32HexDigits(ip, false), ipv6_hex_strings[i],
		"IPV6 hex[" + i + "]");
  }
  for (var i = 0; i < ipv6_addresses.length; i++) {
    var range = rf.find(ipv6_addresses[i], false);
    t.deepEqual(range, ipv6_ranges[i],
		"IPV6 ranges[" + i + "]");
  }

  t.end();
  
});
