#!/bin/sh

set -e

mkdir -p build/test-classes/
javac -verbose -cp "build/classes/:build/lib/*" -d build/test-classes/ test/java/com/Ostermiller/Ladder/*.java
touch build/test-classes
