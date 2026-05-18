#!/bin/sh

set -e

rm -rf build/www/
mkdir -p build/www/

# Convert markdown to HTML using Pandoc
for md_file in site/md/*.md; do
	html_file="build/www/$(basename "$md_file" .md).html"
	pandoc --from markdown --to html \
		--template site/template.html \
		--standalone \
		"$md_file" -o "$html_file"
done

# Copy all static files
cp -vr site/static/* site/static/.* build/www/
cp -v build/js/ladder.js build/www/
cp -v levels/* build/www/
cp -v build/java/ladder.jar build/www/
cp -v releases/*.jar build/www/

# Update jar size in download.html
jarSize=`ls -hl build/java/ladder.jar | awk -F " " {'print $5'}` && sed -Ei "s/Executable Jar - [0-9a-zA-Z\.]*/Executable Jar - ${jarSize}/" build/www/download.html

touch build/www/
echo build/www/ created
