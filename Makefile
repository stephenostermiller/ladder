JFLAGS=
JAVAC=javac
JAVA=java
JAVADOC=javadoc
BTE=$(JAVA) $(JFLAGS) com.Ostermiller.bte.Compiler
CVS=cvs

all: compile build javadoc web

compile:
	$(JAVAC) $(JFLAGS) *.java

junkclean:
	rm -rf *~ ~* *.bak com/ docs/

buildclean: junkclean
	rm -f ladder.jar
        
javadocclean: junkclean
	rm -rf doc/

webclean: junkclean
	rm -f `find . -name "*.bte" | sed s/.bte/.html/`

clean: buildclean javadocclean webclean
	rm -f *.class

build:
	rm -f *~
	rm -f ladder.jar
	rm -rf com/
	mkdir -p com/Ostermiller/Ladder
	cp *.* Makefile com/Ostermiller/Ladder/
	jar cmfv Ladder.mf ladder.jar com/ > /dev/null
	rm -rf com/

javadoc:
	rm -rf doc/
	mkdir doc
	mv package.html temp
	$(JAVADOC) -quiet -d doc/ com.Ostermiller.Ladder > /dev/null
	mv temp package.html

web:
	$(BTE) .

update: clean
	$(CVS) update
        
commit: clean
	$(CVS) commit

release: update all commit
	scp *.html *.jar *.css deadsea@ostermiller.org:www/ladder
