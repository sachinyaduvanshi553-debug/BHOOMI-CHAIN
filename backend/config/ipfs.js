const { create } = require('kubo-rpc-client');

/**
 * IPFS Client Configuration for real document storage.
 * Connects to the local IPFS node via Kubo RPC.
 */
class IPFSManager {
    constructor() {
        this.ipfsUrl = process.env.IPFS_RPC_URL || 'http://127.0.0.1:5001';
        this.client = create({ url: this.ipfsUrl });
    }

    async uploadFile(fileBuffer) {
        if (process.env.MOCK_BLOCKCHAIN === 'true') {
            console.log('[MOCK] IPFS Uploading dummy file');
            return 'QmMockCID123456789' + Date.now();
        }
        try {
            const { cid } = await this.client.add(fileBuffer);
            return cid.toString();
        } catch (error) {
            console.error('IPFS Upload Error:', error);
            throw new Error('Failed to upload document to IPFS');
        }
    }

    /**
     * Get a file from IPFS by CID.
     * @param {string} cid - The Content ID
     */
    async getFile(cid) {
        if (process.env.MOCK_BLOCKCHAIN === 'true') {
            console.log('[MOCK] IPFS Retrieving dummy file for CID:', cid);
            return Buffer.from('Mock content for CID ' + cid);
        }
        try {
            const chunks = [];
            for await (const chunk of this.client.cat(cid)) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        } catch (error) {
            console.error('IPFS Retrieval Error:', error);
            throw new Error('Failed to retrieve document from IPFS');
        }
    }
}

module.exports = new IPFSManager();
