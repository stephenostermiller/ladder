#!/bin/sh

set -e

mkdir -p build/bte/
cp -v site/*.bte build/bte/
pushd build/bte/
    bte *.bte
popd
rm -rf www/
mkdir -p www/
cp -vr build/bte/* www/ | grep -v '\.bte'
cp -vr site/* www/ | grep -v '\.bte'
find www/ -name '*.bte' -delete
cp -v ladder.jar www/
jarSize=`ls -hl ladder.jar | awk -F " " {'print $5'}` && sed -Ei "s/Executable Jar - [0-9a-zA-Z\.]*/Executable Jar - ${jarSize}/" www/download.html
touch www/
echo www/ created
