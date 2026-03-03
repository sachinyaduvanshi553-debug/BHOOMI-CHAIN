#!/bin/bash
# =================================================================
# BhoomiChain – network-up.sh (Production-Grade)
# Bootstraps the full Hyperledger Fabric network using Docker CLI.
# =================================================================

set -e
set -o pipefail

# ---- Configuration -------------------------------------------
CHANNEL_NAME="bhoomichannel"
CC_NAME="landregistry"
CC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode"
CC_LABEL="${CC_NAME}_1.0"
CC_VERSION="1.0"
CC_SEQUENCE=1
DELAY=5

ORDERER_CA="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/bhoomichain.com/orderers/orderer.bhoomichain.com/tls/ca.crt"
REVENUE_PEER_CA="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/revenueorg.bhoomichain.com/peers/peer0.revenueorg.bhoomichain.com/tls/ca.crt"
REGISTRAR_PEER_CA="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/registrarorg.bhoomichain.com/peers/peer0.registrarorg.bhoomichain.com/tls/ca.crt"

echo "================================================================="
echo "  BhoomiChain Network Bootstrap (Production-Grade)"
echo "================================================================="

# ---- Step 1: Generate crypto material (inside tools container) ----
echo ">>> Step 1: Generating crypto material..."
docker run --rm -v $(pwd):/net hyperledger/fabric-tools:2.5.5 cryptogen generate --config=/net/crypto-config.yaml --output="/net/crypto-config"
echo "    Done."

# ---- Step 2: Generate channel artifacts ----
echo ">>> Step 2: Generating channel artifacts..."
mkdir -p channel-artifacts
docker run --rm -v $(pwd):/net -e FABRIC_CFG_PATH=/net hyperledger/fabric-tools:2.5.5 configtxgen -profile BhoomiOrdererGenesis -channelID system-channel -outputBlock /net/channel-artifacts/genesis.block
docker run --rm -v $(pwd):/net -e FABRIC_CFG_PATH=/net hyperledger/fabric-tools:2.5.5 configtxgen -profile BhoomiChannel -outputCreateChannelTx /net/channel-artifacts/${CHANNEL_NAME}.tx -channelID ${CHANNEL_NAME}
echo "    Done."

# ---- Step 3: Start Docker containers ----
echo ">>> Step 3: Starting Docker containers..."
docker compose up -d
sleep ${DELAY}
echo "    Done."

# ---- Step 4: Create the channel ----
echo ">>> Step 4: Creating channel ${CHANNEL_NAME}..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/revenueorg.bhoomichain.com/users/Admin@revenueorg.bhoomichain.com/msp cli peer channel create -o orderer.bhoomichain.com:7050 -c ${CHANNEL_NAME} -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.tx --outputBlock /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block --tls --cafile ${ORDERER_CA}
echo "    Done."

# ---- Step 5: Join peers to channel ----
echo ">>> Step 5: Joining peers to channel..."
docker exec cli peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block
docker exec -e CORE_PEER_ADDRESS=peer0.registrarorg.bhoomichain.com:9051 -e CORE_PEER_LOCALMSPID=RegistrarOrgMSP -e CORE_PEER_TLS_ROOTCERT_FILE=${REGISTRAR_PEER_CA} -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/registrarorg.bhoomichain.com/users/Admin@registrarorg.bhoomichain.com/msp cli peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block
echo "    Done."

# ---- Step 6: Package chaincode ----
echo ">>> Step 6: Packaging chaincode..."
docker exec cli peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_PATH} --lang node --label ${CC_LABEL}
echo "    Done."

# ---- Step 7: Install chaincode ----
echo ">>> Step 7: Installing chaincode on peers..."
docker exec cli peer lifecycle chaincode install ${CC_NAME}.tar.gz
docker exec -e CORE_PEER_ADDRESS=peer0.registrarorg.bhoomichain.com:9051 -e CORE_PEER_LOCALMSPID=RegistrarOrgMSP -e CORE_PEER_TLS_ROOTCERT_FILE=${REGISTRAR_PEER_CA} -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/registrarorg.bhoomichain.com/users/Admin@registrarorg.bhoomichain.com/msp cli peer lifecycle chaincode install ${CC_NAME}.tar.gz
echo "    Done."

# ---- Step 8: Get Package ID ----
CC_PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep "${CC_LABEL}" | awk '{print $3}' | sed 's/,//')
echo "    Package ID: ${CC_PACKAGE_ID}"

# ---- Step 9: Approve for both Orgs ----
echo ">>> Step 9: Approving chaincode for both orgs..."
docker exec cli peer lifecycle chaincode approveformyorg -o orderer.bhoomichain.com:7050 --channelID ${CHANNEL_NAME} --name ${CC_NAME} --version ${CC_VERSION} --package-id ${CC_PACKAGE_ID} --sequence ${CC_SEQUENCE} --tls --cafile ${ORDERER_CA}
docker exec -e CORE_PEER_ADDRESS=peer0.registrarorg.bhoomichain.com:9051 -e CORE_PEER_LOCALMSPID=RegistrarOrgMSP -e CORE_PEER_TLS_ROOTCERT_FILE=${REGISTRAR_PEER_CA} -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/registrarorg.bhoomichain.com/users/Admin@registrarorg.bhoomichain.com/msp cli peer lifecycle chaincode approveformyorg -o orderer.bhoomichain.com:7050 --channelID ${CHANNEL_NAME} --name ${CC_NAME} --version ${CC_VERSION} --package-id ${CC_PACKAGE_ID} --sequence ${CC_SEQUENCE} --tls --cafile ${ORDERER_CA}
echo "    Done."

# ---- Step 10: Commit chaincode with PDC ----
echo ">>> Step 10: Committing chaincode with Private Data Collections..."
docker exec cli peer lifecycle chaincode commit -o orderer.bhoomichain.com:7050 --channelID ${CHANNEL_NAME} --name ${CC_NAME} --version ${CC_VERSION} --sequence ${CC_SEQUENCE} --tls --cafile ${ORDERER_CA} --collections-config ${CC_PATH}/collections_config.json --peerAddresses peer0.revenueorg.bhoomichain.com:7051 --tlsRootCertFiles ${REVENUE_PEER_CA} --peerAddresses peer0.registrarorg.bhoomichain.com:9051 --tlsRootCertFiles ${REGISTRAR_PEER_CA}
echo "    Done."

echo "================================================================="
echo "  BhoomiChain (Production-Grade) is UP!"
echo "================================================================="
