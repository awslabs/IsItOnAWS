# Lots of stuff to do here - most obviously, upload the lambda with the AWS CLI

zip:	dist.zip
	zip -r dist.zip newranges.js isitonaws.js lib node_modules data --exclude '*~' ranges.js

dist.zip:	*.js lib/*.js test/*.js data/index.html

test:	dist.zip
	NODE_PATH=/usr/local/lib/node_modules tape test/*_test.js

npm:	
	npm install async ipaddr.js jszip raw-body sprintf-js
	npm install -g tape
