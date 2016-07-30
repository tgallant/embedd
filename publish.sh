#!/usr/bin/env bash
LOCATION=embedd.io/embedd.min.js
FILE=dist/embedd.min.js
aws s3 cp $FILE s3://$LOCATION
