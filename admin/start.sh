#!/bin/bash

# Script to start admin panel (fixes directory issues)

cd "$(dirname "$0")" || exit 1

echo "📁 Current directory: $(pwd)"
echo "🚀 Starting admin panel..."
echo ""

npm run dev

