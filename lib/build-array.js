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

module.exports.build = function(ranges, rangefinder) {

  var ipv4Ranges = ranges.prefixes.map(function(rangeIn) {
    return {
      region: rangeIn.region,
      service: rangeIn.service,
      cidr: rangeIn.ip_prefix,
      range: rangefinder.find(rangeIn.ip_prefix, true)
    }
  });

  var ipv6Ranges = ranges.ipv6_prefixes.map(function(rangeIn) {
    return {
      region: rangeIn.region,
      service: rangeIn.service,
      cidr: rangeIn.ipv6_prefix,
      range: rangefinder.find(rangeIn.ipv6_prefix, false)
    }
  });

  return ipv4Ranges.concat(ipv6Ranges).sort(function(a, b) {
    if (a.range.min < b.range.min) {
      return -1;
    }
    if (a.range.min > b.range.min) {
      return 1;
    } 
    return 0;
  });
  
};
