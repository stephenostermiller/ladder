#!/bin/sh

set -e

JUNIT_JAR="$HOME/.m2/repository/junit/junit/4.11/junit-4.11.jar"
HAMCREST_JAR="$HOME/.m2/repository/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar"

java \
	-cp "build/java/src-classes/:build/java/test-classes/:build/java/test-lib/*:${JUNIT_JAR}:${HAMCREST_JAR}" \
	org.junit.runner.JUnitCore \
	com.Ostermiller.Ladder.LadderTest

mkdir -p build
touch build/java-test
