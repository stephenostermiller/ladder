.PHONY: all
all: build/www

.PHONY: test
test: build/java-test build/js-test

build/java/test-lib: script/java-test-lib-download.sh java/pom.xml
	./script/java-test-lib-download.sh

build/java/src-classes: script/java-src-compile.sh build/java/test-lib $(wildcard java/src/com/Ostermiller/Ladder/*.java)
	./script/java-src-compile.sh

build/java/test-classes: script/java-test-compile.sh build/java/src-classes build/java/test-lib $(wildcard java/test/java/com/Ostermiller/Ladder/*.java)
	./script/java-test-compile.sh

build/java/ladder.jar: build/java-test script/java-jar-build.sh build/java/src-classes java/src/Ladder.mf $(wildcard java/src/com/Ostermiller/Ladder/*.ini) $(wildcard levels/*)
	./script/java-jar-build.sh

.PHONY: run-java
run-java: build/java/ladder.jar
	java -jar build/java/ladder.jar

build/java-test: build/java/test-classes build/java/src-classes build/java/test-lib
	./script/java-tests-run.sh

build/js/node_modules: script/js-install.sh js/package.json js/package-lock.json
	./script/js-install.sh

build/js/ladder.js: build/js-test script/js-build.sh $(wildcard js/src/*.js)
	./script/js-build.sh

build/js-test: build/js/node_modules script/js-tests-run.sh $(wildcard js/src/*) $(wildcard js/test/*)
	./script/js-tests-run.sh

build/www: script/www-build.sh build/java/ladder.jar build/js/ladder.js $(wildcard site/md/*.md) site/template.html $(wildcard site/static/*) $(wildcard site/static/.*) $(wildcard releases/*) $(wildcard levels/*)
	./script/www-build.sh

.PHONY: clean
clean:
	rm -rf build/
