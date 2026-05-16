.PHONY: all
all: www

.PHONY: compile-java
compile-java:
	javac -d build/classes/ java/com/Ostermiller/Ladder/*.java

ladder.jar: Makefile compile-java
	@rm -rf build/jar/
	@mkdir -p build/jar/
	@rm -f build/ladder.jar
	@cp -vr build/classes/* build/jar/
	@cp -v java/Ladder.mf build/jar/
	@cp -v java/com/Ostermiller/Ladder/*.ini build/jar/com/Ostermiller/Ladder/
	@cp -v levels/* build/jar/com/Ostermiller/Ladder/
	@cd build/jar/ && jar cmfv Ladder.mf ../../ladder.jar com/
	@echo ladder.jar created

.PHONY: run-java
run-java: ladder.jar
	@$(JAVA) -jar ladder.jar

.PHONY: build
build: ladder.jar

.PHONY: www
www: ladder.jar
	@mkdir -p build/bte/
	@cp -v site/*.bte build/bte/
	@cd build/bte/ && bte *.bte
	@rm -rf www/
	@mkdir -p www/
	@cp -vr build/bte/* www/ | grep -v '\.bte'
	@cp -vr site/* www/ | grep -v '\.bte'
	@find www/ -name '*.bte' -delete
	@cp -v ladder.jar www/
	@jarSize=`ls -hl ladder.jar | awk -F " " {'print $$5'}` && sed -Ei "s/Executable Jar - [0-9a-zA-Z\.]*/Executable Jar - $${jarSize}/" www/download.html
	@echo www/ created
