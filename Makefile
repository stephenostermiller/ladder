JFLAGS=
JAVAC=javac
JAVA=java
JAVADOC=javadoc
JLEX=$(JAVA) $(JFLAGS) JFlex.Main
JCUP=$(JAVA) $(JFLAGS) java_cup.Main

all:
	$(JAVAC) $(JFLAGS) *.java

clean:
	rm -f *.class
	rm -f *~
	rm -f ladder.jar
	rm -rf com/
	rm -rf docs/

build:
	rm -f *~
	rm -f ladder.jar
	rm -rf com/
	mkdir com
	mkdir com/Ostermiller
	mkdir com/Ostermiller/Ladder
	cp *.* Makefile com/Ostermiller/Ladder/
	jar cmfv Ladder.mf ladder.jar com/
	rm -rf com/

docs:
	rm -rf docs/
	mkdir docs
	$(JAVADOC) -d docs/ com.Ostermiller.Ladder
