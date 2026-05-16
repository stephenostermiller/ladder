.PHONY: all
all: www

build/classes: script/java-compile.sh $(wildcard java/com/Ostermiller/Ladder/*.java)
	@./script/java-compile.sh

ladder.jar: script/jar-build.sh build/classes java/Ladder.mf $(wildcard java/com/Ostermiller/Ladder/*.ini) $(wildcard levels/*)
	@./script/jar-build.sh

.PHONY: run-java
run-java: ladder.jar
	@java -jar ladder.jar

www: script/www-build.sh ladder.jar $(wildcard site/*) $(wildcard releases/*)
	@./script/www-build.sh

.PHONY: clean
clean:
	@rm -rf build/ ladder.jar www/
