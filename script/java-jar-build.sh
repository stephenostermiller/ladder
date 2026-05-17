#!/bin/sh

set -e

rm -rf build/java/jar/
mkdir -p build/java/jar/
cp -vr build/java/src-classes/* build/java/jar/
cp -v java/src/Ladder.mf build/java/jar/
cp -v java/src/com/Ostermiller/Ladder/*.ini build/java/jar/com/Ostermiller/Ladder/
cp -v levels/* build/java/jar/com/Ostermiller/Ladder/
pushd build/java/jar/
	jar cmfv Ladder.mf ../ladder.jar com/
popd
echo build/java/ladder.jar created
