#!/bin/bash

# Quick start script for Financial Document Analyzer Backend
# This script can be run from the project root

set -e

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to backend and run the start script
cd "$SCRIPT_DIR/backend"
./start.sh "$@"
