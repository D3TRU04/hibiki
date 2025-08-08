#!/bin/bash

echo "🚀 Deploying Kleo Subgraph..."

# Check if Graph CLI is installed
if ! command -v graph &> /dev/null; then
    echo "❌ Graph CLI not found. Installing..."
    npm install -g @graphprotocol/graph-cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate types
echo "🔧 Generating types..."
npm run codegen

# Build subgraph
echo "🔨 Building subgraph..."
npm run build

# Deploy to hosted service
echo "🌐 Deploying to hosted service..."
npm run deploy:hosted

echo "✅ Subgraph deployment complete!"
echo "🔗 GraphQL endpoint will be available at: https://api.studio.thegraph.com/query/kleo-subgraph"
echo "📊 Playground: https://api.studio.thegraph.com/query/kleo-subgraph/playground"

# Instructions for next steps
echo ""
echo "📋 Next steps:"
echo "1. Update your .env.local with the GraphQL endpoint"
echo "2. Test queries in the playground"
echo "3. Integrate with your frontend"
echo ""
echo "🎉 Subgraph is ready for indexing events!" 