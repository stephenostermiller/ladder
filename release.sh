#!/bin/bash

size=`ls -lah ladder.jar`
size=${size:38:4}
if [ -z "`grep $size download.html`" ]
then
    echo "ladder.jar size is $size but download.html does not show that."
    exit 1
fi

FILES=$@
FILES=${FILES/package.html/} 
FILES=${FILES/web/} 
FILES=${FILES/javadoc/} 
FILES=${FILES/compile/} 
if [ "$FILES" ]
then
	echo Make: Uploading to web site: $FILES
	scp -r $FILES deadsea@ostermiller.org:www/ladder
fi
