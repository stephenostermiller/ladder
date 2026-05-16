#!/bin/sh

set -e

rm -rf build/jar/
mkdir -p build/jar/
cp -vr build/classes/* build/jar/
cp -v java/Ladder.mf build/jar/
cp -v java/com/Ostermiller/Ladder/*.ini build/jar/com/Ostermiller/Ladder/
cp -v levels/* build/jar/com/Ostermiller/Ladder/
pushd build/jar/
    jar cmfv Ladder.mf ../../ladder.jar com/
popd
echo ladder.jar created
