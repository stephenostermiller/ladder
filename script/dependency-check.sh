#!/bin/bash
# Verify that all project dependencies are installed with minimum required versions

set -e

REQUIRED_NODE_VERSION="14"
REQUIRED_JAVA_VERSION="11"
REQUIRED_MAVEN_VERSION="3.6"

check_command() {
    local cmd=$1
    local name=$2
    local min_version=$3

    if ! command -v "$cmd" &> /dev/null; then
        echo "❌ $name is not installed"
        return 1
    fi

    if [ -z "$min_version" ]; then
        echo "✅ $name is installed"
        return 0
    fi

    return 0
}

check_node() {
    echo "✅ Node.js is installed"
    local version=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$version" -lt "$REQUIRED_NODE_VERSION" ]; then
        echo "  ❌ Version $(node -v) installed, but v$REQUIRED_NODE_VERSION+ required"
        return 1
    else
        echo "  ✅ Version: $(node -v)"
    fi
    return 0
}

check_java() {
    echo "✅ Java is installed"
    local version=$(java -version 2>&1 | grep 'version' | sed 's/.*version "\([0-9]*\).*/\1/')
    if [ -z "$version" ]; then
        echo "  ❌ Version could not be determined"
        return 1
    fi
    if [ "$version" -lt "$REQUIRED_JAVA_VERSION" ]; then
        echo "  ❌ Version $version installed, but $REQUIRED_JAVA_VERSION+ required"
        return 1
    else
        echo "  ✅ Version: $(java -version 2>&1 | head -1)"
    fi
    return 0
}

check_maven() {
    echo "✅ Maven is installed"
    local version=$(mvn --version 2>&1 | grep 'Apache Maven' | sed 's/.*Apache Maven \([0-9.]*\).*/\1/' | cut -d. -f1,2)
    if [ -z "$version" ]; then
        echo "  ❌ Version could not be determined"
        return 1
    fi
    if [ "$(printf '%s\n' "$REQUIRED_MAVEN_VERSION" "$version" | sort -V | head -n1)" != "$REQUIRED_MAVEN_VERSION" ]; then
        echo "  ❌ Version $version installed, but $REQUIRED_MAVEN_VERSION+ required"
        return 1
    else
        echo "  ✅ Version: $version"
    fi
    return 0
}

check_make() {
    local version=$(make --version 2>&1 | head -1 | sed 's/.*GNU Make //; s/Built.*//')
    echo "  ✅ Version: $version"
    return 0
}

check_pandoc() {
    local version=$(pandoc --version 2>&1 | head -1 | sed 's/pandoc //')
    echo "  ✅ Version: $version"
    return 0
}

echo "Checking project dependencies..."
echo

all_good=true

if ! check_command "node" "Node.js" "$REQUIRED_NODE_VERSION"; then
    all_good=false
else
    check_node || all_good=false
fi
echo

if ! check_command "java" "Java" "$REQUIRED_JAVA_VERSION"; then
    all_good=false
else
    check_java || all_good=false
fi
echo

if ! check_command "mvn" "Maven" "$REQUIRED_MAVEN_VERSION"; then
    all_good=false
else
    check_maven || all_good=false
fi
echo

if ! check_command "make" "GNU Make"; then
    all_good=false
else
    check_make || all_good=false
fi
echo

if ! check_command "pandoc" "Pandoc"; then
    all_good=false
else
    check_pandoc || all_good=false
fi
echo

if [ "$all_good" = true ]; then
    echo "✅ All dependencies are installed and meet version requirements!"
    exit 0
else
    echo "❌ Some dependencies are missing or need updating."
    exit 1
fi
