JFLAGS=
JAVAC=javac
JAVA=java
JAVADOC=javadoc
BTE=$(JAVA) $(JFLAGS) com.Ostermiller.bte.Compiler

all: compile build doc web

compile:
	$(JAVAC) $(JFLAGS) *.java

clean:
	rm -f *.class *~ ladder.jar
	rm -rf doc/ docs/ com/
	rm -f `find . -name "*.bte" | sed s/.bte/.html/`

build:
	rm -f *~
	rm -f ladder.jar
	rm -rf com/
	mkdir -p com/Ostermiller/Ladder
	cp *.* Makefile com/Ostermiller/Ladder/
	jar cmfv Ladder.mf ladder.jar com/
	rm -rf com/

doc:
	rm -rf docs/
	mkdir docs
	$(JAVADOC) -d docs/ com.Ostermiller.Ladder

web:
	$(BTE) . 
