.PHONY: all
all: test www

build/lib: pom.xml
	@mkdir -p build/lib
	@mvn dependency:copy-dependencies -DoutputDirectory=build/lib
	@touch build/lib

build/classes: script/java-compile.sh build/lib $(wildcard java/com/Ostermiller/Ladder/*.java)
	@./script/java-compile.sh

build/test-classes: script/test-compile.sh build/classes build/lib $(wildcard test/java/com/Ostermiller/Ladder/*.java)
	@./script/test-compile.sh

ladder.jar: script/jar-build.sh build/classes java/Ladder.mf $(wildcard java/com/Ostermiller/Ladder/*.ini) $(wildcard levels/*)
	@./script/jar-build.sh

.PHONY: run-java
run-java: ladder.jar
	@java -jar ladder.jar

.PHONY: test
test: build/test-classes
	@./script/test-run.sh

www: script/www-build.sh ladder.jar $(wildcard site/*) $(wildcard releases/*)
	@./script/www-build.sh

.PHONY: clean
clean:
	@rm -rf build/ ladder.jar www/
