const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

/**
 * Wallet Manager for Hyperledger Fabric identities.
 * Stores certificates and private keys in the 'wallet' directory.
 */
class WalletManager {
    constructor() {
        this.walletPath = path.join(__dirname, '../wallet');
    }

    async getWallet() {
        if (!fs.existsSync(this.walletPath)) {
            fs.mkdirSync(this.walletPath, { recursive: true });
        }
        return await Wallets.newFileSystemWallet(this.walletPath);
    }

    async identityExists(label) {
        const wallet = await this.getWallet();
        return await wallet.get(label);
    }
}

module.exports = new WalletManager();
