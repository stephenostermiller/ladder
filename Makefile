.PHONY: all
all: test build/www

build/java/test-lib: script/java-test-lib-download.sh java/pom.xml
	@./script/java-test-lib-download.sh

build/java/src-classes: script/java-src-compile.sh build/java/test-lib $(wildcard java/src/com/Ostermiller/Ladder/*.java)
	@./script/java-src-compile.sh

build/java/test-classes: script/java-test-compile.sh build/java/src-classes build/java/test-lib $(wildcard java/test/java/com/Ostermiller/Ladder/*.java)
	@./script/java-test-compile.sh

build/java/ladder.jar: script/java-jar-build.sh build/java/src-classes java/src/Ladder.mf $(wildcard java/src/com/Ostermiller/Ladder/*.ini) $(wildcard levels/*)
	@./script/java-jar-build.sh

.PHONY: run-java
run-java: build/java/ladder.jar
	@java -jar build/java/ladder.jar

.PHONY: test
test: build/java/test-classes
	@./script/test-run.sh

build/www: script/www-build.sh build/java/ladder.jar $(wildcard site/*) $(wildcard releases/*) $(wildcard src/js/*) $(wildcard levels/*)
	@./script/www-build.sh

.PHONY: clean
clean:
	@rm -rf build/
