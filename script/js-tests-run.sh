#!/bin/sh

set -e

pushd js
	npm test -- --run
popd

mkdir -p build/
touch build/js-test
