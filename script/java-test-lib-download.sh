#!/bin/sh

set -e

mkdir -p build/java/test-lib
mvn -f java/pom.xml dependency:copy-dependencies -DoutputDirectory=../build/java/test-lib
touch build/java/test-lib
