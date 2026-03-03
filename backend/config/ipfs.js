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

    /**
     * Upload a file buffer to IPFS.
     * @param {Buffer} fileBuffer - The file data
     * @returns {string} The CID (Content ID) of the uploaded file
     */
    async uploadFile(fileBuffer) {
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
