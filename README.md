# Is It on AWS?

A couple of Lambda functions that combine to support the mini-website at
[IsItOnAWS.com](https://isitonaws.com)

## How it works

The Lambda function in newranges.js is subscribed to the SNS topic announcing
changes to the IP-Ranges JSON resource.  It retrieves that resource and
generates another function based on the code in isitonaws.js, including
a form of the IP-Ranges compiled to make it easily searchable.

## Why?

To show a bunch of different AWS services working together to produce a
hands-off, simple, serverless mini-app.
