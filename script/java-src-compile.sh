#!/bin/sh

set -e

mkdir -p build/java/src-classes/
javac -verbose -d build/java/src-classes/ java/src/com/Ostermiller/Ladder/*.java
touch build/java/src-classes
