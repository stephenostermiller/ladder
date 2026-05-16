#!/bin/sh

set -e

mkdir -p build/classes/
javac -d build/classes/ java/com/Ostermiller/Ladder/*.java
touch build/classes
