#!/bin/sh

set -e

mkdir -p build/bte/
cp -v site/*.bte build/bte/
pushd build/bte/
	bte *.bte
popd
rm -rf build/www/
mkdir -p build/www/
cp -vr build/bte/* build/www/ | grep -v '\.bte'
cp -vr site/* build/www/ | grep -v '\.bte'
cp -v js/src/* build/www/
cp -v levels/* build/www/
find build/www/ -name '*.bte' -delete
cp -v build/java/ladder.jar build/www/
cp -v releases/*.jar build/www/
jarSize=`ls -hl build/java/ladder.jar | awk -F " " {'print $5'}` && sed -Ei "s/Executable Jar - [0-9a-zA-Z\.]*/Executable Jar - ${jarSize}/" build/www/download.html
touch build/www/
echo build/www/ created
