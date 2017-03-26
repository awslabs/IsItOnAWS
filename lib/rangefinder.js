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

var ipaddr = require('ipaddr.js');
var sprintf = require('sprintf-js');

/* The idea is to take IPv4 and IPv6 addresses and turn them into 32-hex-digit
 *  strings that encode the IPv6 version in the simplest possible way; the idea
 *  is to make them comparable, sortable, and thus searchable, even in a 
 *  language that doesn’t know 128-bit numbers.
 */

TRAILING_MAX_BITS = [ 0x0, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f ];

function toHex(array) {
  return array.map(function(b) { return sprintf.sprintf("%02x", b) }).join('');
}

module.exports.to16Bytes = function(address, ipv4) {
  var ip = ipaddr.parse(address);
  if (ipv4) {
    ip = ip.toIPv4MappedAddress();
  }
  return ip.toByteArray();
}

module.exports.to32HexDigits = function to32HexDigits(address, ipv4) {
  return toHex(this.to16Bytes(address, ipv4));
}

/**
 * Given a CIDR (v4 or v6), turn it into a record with min & max
 *  fields representing the lowest and highest possible addresses,
 *  each expressed as a hex string representation of the IPv6 form
 */
module.exports.find = function(cidr, ipv4) {

  var split = cidr.split('/');
  var baseBytes = this.to16Bytes(split[0], ipv4);
  var maskBits = parseInt(split[1]);
  maskBits = (ipv4) ? 32 - maskBits : 128 - maskBits;
  
  // baseBytes is the lowest value in the range. We need to compute the
  // highest value
  var maxBytes = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  for (var i = 15; i >= 0; i--) {
    if (maskBits >= 8) {
      maxBytes[i] = 0xff;
    } else if (maskBits <= 0) {
      maxBytes[i] = baseBytes[i];
    } else {
      maxBytes[i] = baseBytes[i] | TRAILING_MAX_BITS[maskBits];
    }
    maskBits -= 8;
  }
  
  return { min: toHex(baseBytes), max: toHex(maxBytes) };
}
