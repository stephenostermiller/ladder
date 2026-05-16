#!/bin/sh

set -e

mkdir -p build/test-classes/

# Compile production code first
javac -d build/classes/ java/com/Ostermiller/Ladder/*.java

# Compile test code with production classes and downloaded dependencies on the classpath
javac \
	-cp "build/classes/:build/lib/*" \
	-d build/test-classes/ \
	test/java/com/Ostermiller/Ladder/*.java

touch build/test-classes
