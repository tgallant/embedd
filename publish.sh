#!/usr/bin/env bash

# deploy to AWS
LOCATION=embedd.io/embedd.min.js
FILE=dist/embedd.min.js
aws s3 cp $FILE s3://$LOCATION --region us-west-2

# Clear Cloudflare Cache
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/${CF_ZONE}/purge_cache" \
     -H "X-Auth-Email: ${CF_EMAIL}" \
     -H "X-Auth-Key: ${CF_KEY}" \
     -H "Content-Type: application/json" \
     --data '{"files":["https://embedd.io/embedd.min.js"]}'
