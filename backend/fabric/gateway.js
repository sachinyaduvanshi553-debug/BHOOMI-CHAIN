const { connect, signers } = require('@hyperledger/fabric-gateway');
const grpc = require('@grpc/grpc-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const walletManager = require('./wallet');

/**
 * Enhanced Fabric Gateway for Production-Grade Identity Management.
 * Dynamically selects the correct identity from the wallet for each user.
 */
class FabricGateway {
    constructor() {
        this.channelName = process.env.FABRIC_CHANNEL_NAME || 'bhoomichannel';
        this.chaincodeName = process.env.FABRIC_CHAINCODE_NAME || 'landregistry';
        this.mspId = process.env.FABRIC_MSP_ID || 'RevenueOrgMSP';
        this.peerEndpoint = process.env.FABRIC_PEER_ENDPOINT || 'localhost:7051';
        this.peerHostAlias = process.env.FABRIC_PEER_HOST_ALIAS || 'peer0.revenueorg.bhoomichain.com';
    }

    async getClient() {
        const tlsRootCertPath = path.resolve(__dirname, process.env.FABRIC_TLS_CERT_PATH);
        const tlsRootCert = fs.readFileSync(tlsRootCertPath);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        return new grpc.Client(this.peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': this.peerHostAlias,
        });
    }

    /**
     * Connect to the gateway using a specific user's identity from the wallet.
     * @param {string} userIdentifier - The unique user ID (e.g. email)
     */
    async getNetwork(userIdentifier = 'admin') {
        if (process.env.MOCK_BLOCKCHAIN === 'true') {
            return { contract: {}, gateway: { close: () => { } }, client: { close: () => { } } };
        }

        const client = await this.getClient();
        const wallet = await walletManager.getWallet();
        const identity = await wallet.get(userIdentifier);

        if (!identity) {
            throw new Error(`Identity for ${userIdentifier} not found in wallet. Please register/enroll first.`);
        }

        const gateway = connect({
            client,
            identity: {
                mspId: this.mspId,
                credentials: Buffer.from(identity.credentials.certificate),
            },
            signer: signers.newPrivateKeySigner(crypto.createPrivateKey(identity.credentials.privateKey)),
            evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
            submitOptions: () => ({ deadline: Date.now() + 30000 }),
        });

        const network = gateway.getNetwork(this.channelName);
        const contract = network.getContract(this.chaincodeName);

        return { contract, gateway, client };
    }

    async submitTransaction(userIdentifier, functionName, ...args) {
        if (process.env.MOCK_BLOCKCHAIN === 'true') {
            console.log(`[MOCK] Submitting ${functionName} for ${userIdentifier}`);
            return JSON.stringify({ txID: 'mock_tx_' + Date.now(), status: 'SUCCESS', data: args });
        }

        const { contract, gateway, client } = await this.getNetwork(userIdentifier);
        try {
            const resultBytes = await contract.submitTransaction(functionName, ...args);
            return resultBytes.toString();
        } finally {
            gateway.close();
            client.close();
        }
    }

    async evaluateTransaction(userIdentifier, functionName, ...args) {
        if (process.env.MOCK_BLOCKCHAIN === 'true') {
            console.log(`[MOCK] Evaluating ${functionName} for ${userIdentifier}`);
            // Return some default mock data for common queries
            if (functionName === 'QueryLand') {
                return JSON.stringify({
                    landID: args[0],
                    currentOwner: 'ramesh@bhoomichain.in',
                    geoCoordinates: '12.97, 77.59',
                    mortgageStatus: false,
                    litigationStatus: false,
                    documentHash: 'QmHash1234Mock'
                });
            }
            if (functionName === 'QueryLandHistory') {
                return JSON.stringify([{
                    txID: 'mock_h1',
                    timestamp: new Date().toISOString(),
                    data: JSON.stringify({ owner: 'ramesh@bhoomichain.in' })
                }]);
            }
            if (functionName === 'QueryAllLands') {
                return JSON.stringify([
                    {
                        landID: 'MOCK-9901',
                        geoCoordinates: '28.61, 77.20',
                        isForSale: true,
                        askingPrice: 5000000,
                        mortgageStatus: false,
                        litigationStatus: false
                    },
                    {
                        landID: 'MOCK-9902',
                        geoCoordinates: '12.97, 77.59',
                        isForSale: true,
                        askingPrice: 8500000,
                        mortgageStatus: false,
                        litigationStatus: false
                    }
                ]);
            }
            return JSON.stringify({ status: 'MOCK_SUCCESS' });
        }

        const { contract, gateway, client } = await this.getNetwork(userIdentifier);
        try {
            const resultBytes = await contract.evaluateTransaction(functionName, ...args);
            return resultBytes.toString();
        } finally {
            gateway.close();
            client.close();
        }
    }
}

module.exports = new FabricGateway();
