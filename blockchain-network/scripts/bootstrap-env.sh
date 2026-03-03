#!/bin/bash
# =================================================================
# BhoomiChain – bootstrap-env.sh
# Fixes common environment issues like missing Fabric binaries
# Runs inside WSL2/Linux
# =================================================================

echo "================================================================="
echo "  BhoomiChain Environment Fabric Fixer"
echo "================================================================="

# 1. Install Docker and Docker-Compose if missing
if ! [ -x "$(command -v docker)" ]; then
  echo ">>> Installing Docker..."
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose
  sudo usermod -aG docker $USER
fi

# 2. Download Hyperledger Fabric Binaries (v2.5.5)
if ! [ -x "$(command -v peer)" ]; then
  echo ">>> Fabric binaries not found. Downloading..."
  curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.5 1.5.7
  
  # Move to a directory in PATH
  echo ">>> Adding Fabric binaries to /usr/local/bin..."
  sudo cp fabric-samples/bin/* /usr/local/bin/
  rm -rf fabric-samples
fi

echo ">>> Verifying installation..."
peer version
cryptogen version
docker-compose --version

echo "================================================================="
echo "  Environment Ready! You can now run ./scripts/network-up.sh"
echo "================================================================="
