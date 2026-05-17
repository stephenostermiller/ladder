#!/bin/sh

set -e

mkdir -p build/java/test-classes/
javac -verbose -cp "build/java/src-classes/:build/java/test-lib/*" -d build/java/test-classes/ java/test/java/com/Ostermiller/Ladder/*.java
touch build/java/test-classes
