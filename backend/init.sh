#!/bin/sh

# Detect OS
OS="$(uname -s)"

# Set the TypeScript command
TSC_CMD="tsc './scripts/create-env.ts' --outDir './scripts' --module ESNext --moduleResolution node"
BUILD_CMD="node './scripts/create-env.js' './' false"
# Use npx if tsc is not installed globally
if ! command -v tsc >/dev/null 2>&1; then
    TSC_CMD="npx $TSC_CMD"
fi

# Windows (Git Bash, MSYS, Cygwin)
case "$OS" in
    CYGWIN*|MINGW*|MSYS*)
        # Use backslashes for Windows paths
        TSC_CMD=$(echo "$TSC_CMD" | sed 's/\.\//.\\/' | sed 's/\//\\/g')
        ;;
esac

# Run the command and then run node script if successful
eval "$TSC_CMD"
eval "$BUILD_CMD"