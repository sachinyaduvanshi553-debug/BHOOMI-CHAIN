const FabricCAServices = require('fabric-ca-client');
const walletManager = require('./wallet');
const fs = require('fs');
const path = require('path');

/**
 * CA Manager for dynamic user enrollment.
 */
class CAManager {
    constructor() {
        this.caUrl = process.env.FABRIC_CA_URL || 'https://localhost:7054';
        this.mspId = process.env.FABRIC_MSP_ID || 'RevenueOrgMSP';
        this.caName = process.env.FABRIC_CA_NAME || 'ca-revenue';

        // MOCK MODE: Don't read file if mocking
        if (process.env.MOCK_BLOCKCHAIN !== 'true') {
            const caTLSCertPath = path.resolve(__dirname, process.env.FABRIC_CA_TLS_CERT_PATH);
            const caTLSCert = fs.readFileSync(caTLSCertPath);
            this.ca = new FabricCAServices(this.caUrl, { trustedRoots: [caTLSCert], verify: false }, this.caName);
        } else {
            console.log('[MOCK] CA Manager initialized in mock mode');
        }
    }

    /**
     * Enroll the admin user if not already exists (required for registering others).
     */
    async enrollAdmin() {
        if (process.env.MOCK_BLOCKCHAIN === 'true') {
            console.log('[MOCK] Skipping Admin enrollment');
            return;
        }
        try {
            const wallet = await walletManager.getWallet();
            const adminIdentity = await wallet.get('admin');

            if (adminIdentity) {
                console.log('Admin identity already exists in wallet');
                return;
            }

            const enrollment = await this.ca.enroll({
                enrollmentID: process.env.FABRIC_CA_ADMIN_USER || 'admin',
                enrollmentSecret: process.env.FABRIC_CA_ADMIN_PW || 'adminpw'
            });

            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: this.mspId,
                type: 'X.509',
            };

            await wallet.put('admin', x509Identity);
            console.log('Successfully enrolled admin and imported into wallet');
        } catch (error) {
            console.error(`Failed to enroll admin: ${error}`);
            throw error;
        }
    }

    /**
     * Register and Enroll a new user identity.
     */
    async registerAndEnrollUser(userId) {
        if (process.env.MOCK_BLOCKCHAIN === 'true') {
            console.log(`[MOCK] Registering and enrolling user ${userId}`);
            // In mock mode, we just store a dummy identity in the local wallet folder 
            // so that gateway.js (also in mock mode) can "find" it if it tries to list it.
            // But actually gateway.js mock mode doesn't check the wallet.
            return;
        }

        try {
            const wallet = await walletManager.getWallet();
            const userIdentity = await wallet.get(userId);

            if (userIdentity) {
                console.log(`Identity for ${userId} already exists`);
                return;
            }

            // Must have admin to register new users
            await this.enrollAdmin();
            const adminIdentity = await wallet.get('admin');
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            // Register the user
            const secret = await this.ca.register({
                enrollmentID: userId,
                role: 'client',
                affiliation: 'org1.department1' // Default matching Fabric sample config
            }, adminUser);

            // Enroll the user
            const enrollment = await this.ca.enroll({
                enrollmentID: userId,
                enrollmentSecret: secret
            });

            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: this.mspId,
                type: 'X.509',
            };

            await wallet.put(userId, x509Identity);
            console.log(`Successfully registered and enrolled user ${userId}`);
        } catch (error) {
            console.error(`Failed to register user ${userId}: ${error}`);
            throw error;
        }
    }
}

module.exports = new CAManager();
