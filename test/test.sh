#!/bin/bash
set -e
./node_modules/istanbul/lib/cli.js cover --report none --print none --dir coverage ./node_modules/mocha/bin/_mocha
./node_modules/istanbul/lib/cli.js report
./node_modules/istanbul/lib/cli.js report text-summary
