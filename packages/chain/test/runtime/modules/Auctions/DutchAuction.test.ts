import "reflect-metadata";
import {
  BlockStorageNetworkStateModule,
  InMemorySigner,
  TestingAppChain,
} from "@proto-kit/sdk";
import {
  BlockProducerModule,
  InMemoryDatabase,
  LocalTaskQueue,
  LocalTaskWorkerModule,
  ManualBlockTrigger,
  ModuleQuery,
  NoopBaseLayer,
  PrivateMempool,
  SettlementModule,
} from "@proto-kit/sequencer";
import {
  Poseidon,
  PrivateKey,
  UInt32,
  Encoding,
  PublicKey,
  Field,
} from "o1js";
import { NFTKey, NFT } from "../../../../src/runtime/modules/nfts";
import { DutchAuction, DutchAuctionModule } from "../../../../src/runtime/modules/Auctions/DutchAuction";
import { log } from "@proto-kit/common";
import { Balances, GAS_TOKEN_ID } from "../../../../src/runtime/modules/balances";
import { BalancesKey, UInt64 } from "@proto-kit/library";
import { getAuctionId } from "../../../../src/runtime/modules/Auctions/Auction";

log.setLevel("ERROR");

describe("DutchAuction", () => {
  let appChain = TestingAppChain.fromRuntime({
    DutchAuctionModule,
    NFT,
    Balances,
  });
  let alicePrivateKey: PrivateKey;
  let alice: PublicKey;
  let bobPrivateKey: PrivateKey;
  let bob: PublicKey;
  let balances: Balances;
  let balanceQuery: ModuleQuery<Balances>;
  let nfts: NFT;
  let nftQuery: ModuleQuery<NFT>;
  let auction: DutchAuctionModule;
  let auctionQuery: ModuleQuery<DutchAuction>;

  const mintTestNFT = async (owner: PrivateKey) => {
    const nftMetadata = Poseidon.hash(
      Encoding.stringToFields(
        JSON.stringify({
          name: "testNFT",
          uri: "...",
        })
      )
    );
    
    appChain.setSigner(owner);
    const tx = await appChain.transaction(owner.toPublicKey(), async () => {
      await nfts.mint(owner.toPublicKey(), nftMetadata);
    });
    await tx.sign();
    await tx.send();
    const block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);
    
    return NFTKey.from(owner.toPublicKey(), UInt32.from(0));
  };

  beforeEach(async () => {
    appChain = TestingAppChain.fromRuntime({
      DutchAuctionModule,
      NFT,
      Balances,
    });

    appChain.configurePartial({
      Runtime: {
        DutchAuctionModule: {},
        NFT: {},
        Balances: {},
      },
    });
    await appChain.start();

    alicePrivateKey = PrivateKey.random();
    alice = alicePrivateKey.toPublicKey();
    bobPrivateKey = PrivateKey.random();
    bob = bobPrivateKey.toPublicKey();

    balances = appChain.runtime.resolve("Balances");
    balanceQuery = appChain.query.runtime.Balances;
    nfts = appChain.runtime.resolve("NFT");
    nftQuery = appChain.query.runtime.NFT;
    auction = appChain.runtime.resolve("DutchAuctionModule");
    auctionQuery = appChain.query.runtime.DutchAuctionModule;

    // Setup initial balances
    appChain.setSigner(alicePrivateKey);
    const tx = await appChain.transaction(alice, async () => {
      await balances.addBalance(alice, UInt64.from(1000));
    });
    await tx.sign();
    await tx.send();
    await appChain.produceBlock();
  });

  it("should successfully create and complete a dutch auction", async () => {
    const minterPrivateKey = PrivateKey.random();
    const minter = minterPrivateKey.toPublicKey();
    
    // Mint NFT
    const nftKey = await mintTestNFT(minterPrivateKey);
    
    // Start auction with start price 1000, decay rate 100 per block, min price 500

    // we need to calculate the auctionId this way as auction.start(..) will return the id using 0 as block height
    const blockHeight = new UInt64((await appChain.query.network.unproven)?.block.height ?? UInt64.from(0));
    const auctionId = getAuctionId(blockHeight.add(UInt64.from(1)), nftKey);

    appChain.setSigner(minterPrivateKey);
    let tx = await appChain.transaction(minter, async () => {
      await auction.start(
        nftKey,
        UInt64.from(1000), // startPrice
        UInt64.from(100),  // decayRate
        UInt64.from(500)   // minPrice
      );
    });
    await tx.sign();
    await tx.send();
    let block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);
    
    console.log("auctionId", auctionId?.toString());
    
    // Verify NFT is locked
    let nft = await nftQuery.nftRecords.get(nftKey);
    expect(nft?.locked.toBoolean()).toBe(true);
    
    // Wait for 1 blocks to let price decay
    await appChain.produceBlock();
    
    // Place bid (price should be 800 now: 1000 - (2 * 100))
    appChain.setSigner(alicePrivateKey);
    tx = await appChain.transaction(alice, async () => {
      await auction.bid(auctionId);
    });
    await tx.sign();
    await tx.send();
    block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);
    
    // Verify final state
    const minterBalance = await balanceQuery.balances.get(
      BalancesKey.from(GAS_TOKEN_ID, minter)
    );
    console.log("minterBalance", minterBalance?.toBigInt());
    expect(minterBalance?.toBigInt()).toBe(800n); // Should get 800 (original 1000 - 2 blocks * 100 decay)
    
    nft = await nftQuery.nftRecords.get(nftKey);
    expect(nft?.owner).toStrictEqual(alice);
    expect(nft?.locked.toBoolean()).toBe(false);
  });

  it("should not let price go below minimum", async () => {
    const minterPrivateKey = PrivateKey.random();
    const minter = minterPrivateKey.toPublicKey();
    
    // Mint NFT
    const nftKey = await mintTestNFT(minterPrivateKey);
    
    // Start auction with start price 1000, decay rate 100, min price 800
    const blockHeight = new UInt64((await appChain.query.network.unproven)?.block.height ?? UInt64.from(0));
    const auctionId = getAuctionId(blockHeight.add(UInt64.from(1)), nftKey);
    appChain.setSigner(minterPrivateKey);
    let tx = await appChain.transaction(minter, async () => {
      await auction.start(
        nftKey,
        UInt64.from(1000), // startPrice
        UInt64.from(100),  // decayRate
        UInt64.from(800)   // minPrice
      );
    });
    await tx.sign();
    await tx.send();
    let block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);
    
    // Wait for 5 blocks - price should hit minimum
    for (let i = 0; i < 5; i++) {
      await appChain.produceBlock();
    }
    
    // Place bid (price should be 800, not 500)
    appChain.setSigner(alicePrivateKey);
    tx = await appChain.transaction(alice, async () => {
      await auction.bid(auctionId);
    });
    await tx.sign();
    await tx.send();
    block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);
    
    // Verify minter got minimum price
    const minterBalance = await balanceQuery.balances.get(
      BalancesKey.from(GAS_TOKEN_ID, minter)
    );
    expect(minterBalance?.toBigInt()).toBe(800n);
  });

  it("should fail if start price is less than min price", async () => {
    const minterPrivateKey = PrivateKey.random();
    const minter = minterPrivateKey.toPublicKey();
    
    // Mint NFT
    const nftKey = await mintTestNFT(minterPrivateKey);
    
    // Try to start auction with invalid prices
    appChain.setSigner(minterPrivateKey);
    const tx = await appChain.transaction(minter, async () => {
      await auction.start(
        nftKey,
        UInt64.from(500),  // startPrice
        UInt64.from(100),  // decayRate
        UInt64.from(800)   // minPrice higher than start price
      );
    });
    await tx.sign();
    await tx.send();
    const block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(false);
  });
});
