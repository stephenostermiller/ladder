# Instructions for AI Agents

## Build Process

After making code changes, **only run `make` with no arguments** to build and test:

```bash
make
```

The `make` command will:
- Run all tests
- Regenerate the site
- Handle all necessary build steps

### Important:

- Do not run `make clean`. Make has proper dependency detection, clean isn't needed.
- Do not run individual build scripts like `./script/js-build.sh` or `bash script/java-tests-run.sh`, make will run the appropriate ones for you based on your changes.
- Do not use build commands like `npm run build` or `mvn test` directly, make will run the appropriate ones for you based on your changes.

You *may* run granular commands that are not available through the Makefile to debug a specific part of the application. For example, to run just a single unit test, do it like:

- JavaScript: From the `js/` directory: `npm test -- test/ladder.test.js -t standingStillShowsGSymbol`
- Java: From the `java/` directory: `mvn test -Dtest=LadderTest#standingStillShowsGSymbol`
