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
var cleaner = require('../lib/name-cleaner');

test('clean some names', function(t) {
  var data = [
    { unclean: 'https://foo.com', clean: 'foo.com' },
    { unclean: 'x.org', clean: 'x.org' },
    { unclean: 'httP://ab.com:33/fo/bar/baz', clean: 'ab.com' },
    { unclean: 'rah.org/adfs/23r2/afds', clean: 'rah.org' }
  ];

  data.forEach(function(d) {
    t.equal(d.clean, cleaner.clean(d.unclean));
  });
  t.end();
});
    
