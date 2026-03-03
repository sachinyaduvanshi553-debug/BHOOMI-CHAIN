#!/bin/bash
# =================================================================
# BhoomiChain – network-down.sh
# Tears down all Docker containers and removes crypto artifacts
# Run: bash scripts/network-down.sh  (from blockchain-network/)
# =================================================================

set -e

echo "================================================================="
echo "  BhoomiChain Network Teardown"
echo "================================================================="

echo ""
echo ">>> Stopping and removing Docker containers..."
docker compose down --volumes --remove-orphans 2>/dev/null || true

echo ""
echo ">>> Removing generated crypto material..."
rm -rf ./crypto-config

echo ""
echo ">>> Removing channel artifacts..."
rm -rf ./channel-artifacts

echo ""
echo ">>> Removing packaged chaincode..."
rm -f *.tar.gz

echo ""
echo ">>> Pruning Docker system (dangling images, unused networks)..."
docker system prune -f 2>/dev/null || true

echo ""
echo "================================================================="
echo "  BhoomiChain network is DOWN. All artifacts removed."
echo "================================================================="
