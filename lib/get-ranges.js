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

const https = require('https');

/**
 * Do an HTTP get in a way that fits into async/waterfall
 */

module.exports.get = function(callback) {
  https.get('https://ip-ranges.amazonaws.com/ip-ranges.json', (res) => {
    const statusCode = res.statusCode;

    if (statusCode !== 200) {
      var error = 'Failed to fetch ip-ranges: ' + res.statusCode + '/' + res.statusMessage;
      // consume response data to free up memory
      res.resume();
      callback(error); // won't return
    } else {

      res.setEncoding('utf8');
      var rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
	try {
	  callback(null, JSON.parse(rawData));
	} catch (e) {
	  callback(e.message);
	}
      });
    }
  }).on('error', (e) => {
    callback(`Got error: ${e.message}`);
  });
}

