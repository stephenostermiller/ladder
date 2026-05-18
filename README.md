# Ladder Game

A classic arcade game originally written for CPM operating system, now available in Java and JavaScript for HTML5 Canvas.

## Play Online or Download

The game is playable online and available for download at [https://ladder.ostermiller.org/](https://ladder.ostermiller.org/)

## Dependencies

Before building, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v14+) - Includes npm for JavaScript dependencies
- **[Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/)** (v11+) - For Java compilation and running
- **[Apache Maven](https://maven.apache.org/download.cgi)** (v3.6+) - For Java dependency management
- **[GNU Make](https://www.gnu.org/software/make/)** - For running the build system
- **[Pandoc](https://pandoc.org/installing.html)** - For converting markdown documentation to HTML

Verify installations by running:
```bash
./script/dependency-check.sh
```

## Building the Project

After making code changes, run:

```bash
make
```

The `make` command will:
- Compile the code
- Assemble all archives
- Run all tests
- Generate the site

The [Makefile](Makefile) specifies all dependencies and is idempotent, so it won't run any command a second time without the depedencies changing.

Key pieces of output are:

- `build/java/ladder.jar` — The java executable
- `build/www` — The website, including the JavaScript version that is web-playable

## Project Structure

- [js/](js/) - JavaScript source code and test runners
- [java/](java/) - Java source code and test runners
- [site/](site/) - Website files (HTML templates, styles)
- [levels/](levels/) - Game level files
- [releases/](releases/) - All old Java versions
- [script/](script/) - Build and utility scripts
- [tests/](tests/) - Data for unit tests

## Testing

Tests are run automatically as part of `make`, but you can also run them individually:

- JavaScript tests: [./script/js-tests-run.sh](script/js-tests-run.sh)
- Java tests: [./script/java-tests-run.sh](script/java-tests-run.sh)

## For AI Agents

See [.agents/README.md](.agents/README.md) for AI agent development guidelines.
