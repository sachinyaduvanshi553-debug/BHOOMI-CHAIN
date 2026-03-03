'use strict';

const { Contract } = require('fabric-contract-api');

class LandRegistry extends Contract {

  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');
    // Initial setup if needed
    console.info('============= END : Initialize Ledger ===========');
  }

  /**
   * RegisterLand - Creates a new land parcel.
   * Sensitive owner details are stored in Private Data Collection.
   */
  async RegisterLand(ctx, landID, owner, geoCoordinates, documentHash) {
    const exists = await this.AssetExists(ctx, landID);
    if (exists) {
      throw new Error(`The land parcel ${landID} already exists`);
    }

    // Public record (available to everyone)
    const landAsset = {
      landID: landID,
      geoCoordinates: geoCoordinates,
      documentHash: documentHash,
      mortgageStatus: false,
      litigationStatus: false,
      docType: 'landRecord'
    };

    // Private record (sensitive owner info)
    const landPrivateDetails = {
      landID: landID,
      currentOwner: owner, // Email/ID of owner
      timestamp: new Date().toISOString()
    };

    // Write public data to world state
    await ctx.stub.putState(landID, Buffer.from(JSON.stringify(landAsset)));

    // Write private data to the collection
    await ctx.stub.putPrivateData('collectionLandDetails', landID, Buffer.from(JSON.stringify(landPrivateDetails)));

    // Emit Event
    const eventPayload = { landID, owner, action: 'REGISTER' };
    ctx.stub.setEvent('LandRegistered', Buffer.from(JSON.stringify(eventPayload)));

    return JSON.stringify(landAsset);
  }

  /**
   * TransferOwnership - Changes the owner of a land parcel.
   * Enforces mortgage and litigation checks.
   */
  async TransferOwnership(ctx, landID, newOwner) {
    // 1. Get Public state
    const assetBuffer = await ctx.stub.getState(landID);
    if (!assetBuffer || assetBuffer.length === 0) {
      throw new Error(`Land parcel ${landID} does not exist`);
    }
    const asset = JSON.parse(assetBuffer.toString());

    // 2. Security Check: Block transfer if mortgaged or under litigation
    if (asset.mortgageStatus) {
      throw new Error(`Transfer blocked: Land parcel ${landID} is currently mortgaged`);
    }
    if (asset.litigationStatus) {
      throw new Error(`Transfer blocked: Land parcel ${landID} is under active litigation`);
    }

    // 3. Update Private Data (New Owner)
    const privateDataBuffer = await ctx.stub.getPrivateData('collectionLandDetails', landID);
    if (!privateDataBuffer || privateDataBuffer.length === 0) {
      throw new Error(`Private details for land ${landID} not found`);
    }
    const privateDetails = JSON.parse(privateDataBuffer.toString());

    // Update owner
    privateDetails.currentOwner = newOwner;
    privateDetails.timestamp = new Date().toISOString();

    await ctx.stub.putPrivateData('collectionLandDetails', landID, Buffer.from(JSON.stringify(privateDetails)));

    return JSON.stringify({ landID, status: 'SUCCESS', newOwner });
  }

  // --- Status Update Methods ---

  async AddMortgage(ctx, landID) {
    const asset = await this.QueryLand(ctx, landID);
    asset.mortgageStatus = true;
    await ctx.stub.putState(landID, Buffer.from(JSON.stringify(asset)));
    return JSON.stringify(asset);
  }

  async RemoveMortgage(ctx, landID) {
    const asset = await this.QueryLand(ctx, landID);
    asset.mortgageStatus = false;
    await ctx.stub.putState(landID, Buffer.from(JSON.stringify(asset)));
    return JSON.stringify(asset);
  }

  async MarkLitigation(ctx, landID) {
    const asset = await this.QueryLand(ctx, landID);
    asset.litigationStatus = true;
    await ctx.stub.putState(landID, Buffer.from(JSON.stringify(asset)));
    return JSON.stringify(asset);
  }

  async ClearLitigation(ctx, landID) {
    const asset = await this.QueryLand(ctx, landID);
    asset.litigationStatus = false;
    await ctx.stub.putState(landID, Buffer.from(JSON.stringify(asset)));
    return JSON.stringify(asset);
  }

  // --- Marketplace Logic ---

  /**
   * ListLandForSale - Lists a land parcel for sale with a target price.
   */
  async ListLandForSale(ctx, landID, price) {
    const asset = await this.QueryLand(ctx, landID);

    // Security: Only owner can list (verified by backend gateway usually)
    asset.isForSale = true;
    asset.askingPrice = parseFloat(price);

    await ctx.stub.putState(landID, Buffer.from(JSON.stringify(asset)));
    return JSON.stringify(asset);
  }

  /**
   * ExecutePurchase - Atomically transfers ownership of a listed land.
   */
  async ExecutePurchase(ctx, landID, buyerEmail) {
    const assetBuffer = await ctx.stub.getState(landID);
    if (!assetBuffer || assetBuffer.length === 0) {
      throw new Error(`Land parcel ${landID} does not exist`);
    }
    const asset = JSON.parse(assetBuffer.toString());

    if (!asset.isForSale) {
      throw new Error(`Land parcel ${landID} is not listed for sale`);
    }

    // Reset marketplace status
    asset.isForSale = false;
    asset.askingPrice = 0;

    // Update public state
    await ctx.stub.putState(landID, Buffer.from(JSON.stringify(asset)));

    // Execute transfer in private data
    const privateDataBuffer = await ctx.stub.getPrivateData('collectionLandDetails', landID);
    const privateDetails = JSON.parse(privateDataBuffer.toString());

    privateDetails.currentOwner = buyerEmail;
    privateDetails.timestamp = new Date().toISOString();

    await ctx.stub.putPrivateData('collectionLandDetails', landID, Buffer.from(JSON.stringify(privateDetails)));

    return JSON.stringify({ landID, status: 'PURCHASED', newOwner: buyerEmail });
  }

  // --- Query Methods ---

  async QueryLand(ctx, landID) {
    const assetBuffer = await ctx.stub.getState(landID);
    if (!assetBuffer || assetBuffer.length === 0) {
      throw new Error(`Land parcel ${landID} does not exist`);
    }
    const asset = JSON.parse(assetBuffer.toString());

    // Try to fetch private data (will only succeed for authorized peers)
    try {
      const privateDataBuffer = await ctx.stub.getPrivateData('collectionLandDetails', landID);
      if (privateDataBuffer && privateDataBuffer.length > 0) {
        const privateDetails = JSON.parse(privateDataBuffer.toString());
        asset.currentOwner = privateDetails.currentOwner; // Merge for authorized users
      } else {
        asset.currentOwner = "HIDDEN (Authorized Only)";
      }
    } catch (e) {
      asset.currentOwner = "HIDDEN (Authorized Only)";
    }

    return asset;
  }

  async QueryLandHistory(ctx, landID) {
    const iterator = await ctx.stub.getHistoryForKey(landID);
    const results = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value) {
        const obj = {
          txID: res.value.txId,
          timestamp: res.value.timestamp,
          isDelete: res.value.isDelete,
          data: res.value.value.toString('utf8')
        };
        results.push(obj);
      }
      res = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(results);
  }

  async QueryAllLands(ctx) {
    const startKey = '';
    const endKey = '';
    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    const allResults = [];
    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        const jsonRes = JSON.parse(res.value.value.toString('utf8'));
        allResults.push(jsonRes);
      }
      if (res.done) {
        await iterator.close();
        return JSON.stringify(allResults);
      }
    }
  }

  async AssetExists(ctx, landID) {
    const assetBuffer = await ctx.stub.getState(landID);
    return assetBuffer && assetBuffer.length > 0;
  }
}

module.exports = LandRegistry;
