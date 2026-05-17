#!/bin/bash

set -e

mkdir -p build/js
cp js/package.json build/js/
if [ -f js/package-lock.json ]; then cp js/package-lock.json build/js/; fi
pushd build/js
	npm install
popd
cp build/js/package-lock.json js/package-lock.json
rm -rf js/node_modules
ln -s ../build/js/node_modules js/node_modules
touch build/js/node_modules
