#!/usr/bin/env bash
BUCKET=embedd.io
DIR=_dist/
aws s3 sync $DIR s3://$BUCKET/
