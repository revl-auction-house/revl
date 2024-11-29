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
import { EnglishAuction, EnglishAuctionModule } from "../../../../src/runtime/modules/Auctions/EnglishAuction";
import { log } from "@proto-kit/common";
import { Balances, GAS_TOKEN_ID } from "../../../../src/runtime/modules/balances";
import { BalancesKey, UInt64 } from "@proto-kit/library";
import { getAuctionId } from "../../../../src/runtime/modules/Auctions/Auction";

log.setLevel("ERROR");


describe("EnglishAuction", () => {
  let appChain = TestingAppChain.fromRuntime({
    EnglishAuctionModule,
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
  let auction: EnglishAuctionModule;
  let auctionQuery: ModuleQuery<EnglishAuction>;
  
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
  
  const startAuction = async (
    minterPrivateKey: PrivateKey,
    nftKey: NFTKey,
    duration: UInt64
  ): Promise<Field> => {
    const blockHeight = new UInt64((await appChain.query.network.unproven)?.block.height ?? UInt64.from(0));
    const auctionId = getAuctionId(blockHeight.add(UInt64.from(1)), nftKey);
  
    appChain.setSigner(minterPrivateKey);
    const tx = await appChain.transaction(minterPrivateKey.toPublicKey(), async () => {
      await auction.start(nftKey, duration);
    });
    await tx.sign();
    await tx.send();
    const block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);
  
    return auctionId;
  };
  
  beforeEach(async () => {
    appChain = TestingAppChain.fromRuntime({
      EnglishAuctionModule,
      NFT,
      Balances,
    });

    appChain.configurePartial({
      Runtime: {
        EnglishAuctionModule: {},
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
    auction = appChain.runtime.resolve("EnglishAuctionModule");
    auctionQuery = appChain.query.runtime.EnglishAuctionModule;

    // Setup initial balances
    appChain.setSigner(alicePrivateKey);
    let tx = await appChain.transaction(alice, async () => {
      await balances.addBalance(alice, UInt64.from(1000));
    });
    await tx.sign();
    await tx.send();
    await appChain.produceBlock();    

    tx = await appChain.transaction(alice, async () => {
      await balances.addBalance(bob, UInt64.from(1000));
    });
    await tx.sign();
    await tx.send();
    await appChain.produceBlock();    
  });

  it("should successfully create and complete an auction", async () => {
    const minterPrivateKey = PrivateKey.random();
    const minter = minterPrivateKey.toPublicKey();
    
    // Mint NFT
    const nftKey = await mintTestNFT(minterPrivateKey);
    
    // Start auction
    const auctionId = await startAuction(minterPrivateKey, nftKey, UInt64.from(1));
    
    // Verify NFT is locked
    let nft = await nftQuery.nftRecords.get(nftKey);
    expect(nft?.locked.toBoolean()).toBe(true);
    
    // Place bid
    appChain.setSigner(alicePrivateKey);
    let tx = await appChain.transaction(alice, async () => {
      await auction.placeBid(auctionId, UInt64.from(500));
    });
    await tx.sign();
    await tx.send();
    let block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);
    
    // End auction
    appChain.setSigner(minterPrivateKey);
    tx = await appChain.transaction(minter, async () => {
      await auction.end(auctionId);
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
    expect(minterBalance?.toBigInt()).toBe(500n);
    
    nft = await nftQuery.nftRecords.get(nftKey);
    expect(nft?.owner).toStrictEqual(alice);
    expect(nft?.locked.toBoolean()).toBe(false);
  });

  it("should fail if non-owner tries to start auction", async () => {
    const minterPrivateKey = PrivateKey.random();
    const nftKey = await mintTestNFT(minterPrivateKey);
    
    // Try to start auction as non-owner
    appChain.setSigner(alicePrivateKey);
    const tx = await appChain.transaction(alice, async () => {
      await auction.start(nftKey, UInt64.from(1));
    });
    await tx.sign();
    await tx.send();
    const block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(false);
  });

  it("should fail if bid is lower than current bid", async () => {
    const minterPrivateKey = PrivateKey.random();
    const minter = minterPrivateKey.toPublicKey();
    
    // Mint NFT
    const nftKey = await mintTestNFT(minterPrivateKey);
    
    // Start auction
    const auctionId = await startAuction(minterPrivateKey, nftKey, UInt64.from(10));

    // Place first bid
    appChain.setSigner(alicePrivateKey);
    let tx = await appChain.transaction(alice, async () => {
      await auction.placeBid(auctionId, UInt64.from(500));
    });
    await tx.sign();
    await tx.send();
    let block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);

    // Try to place lower bid
    appChain.setSigner(bobPrivateKey);
    tx = await appChain.transaction(bob, async () => {
      await auction.placeBid(auctionId, UInt64.from(400));
    });
    await tx.sign();
    await tx.send();
    block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(false);
  });

  it("should fail if auction has ended", async () => {
    const minterPrivateKey = PrivateKey.random();
    const minter = minterPrivateKey.toPublicKey();
    
    // Mint NFT
    const nftKey = await mintTestNFT(minterPrivateKey);
    
    // Start auction with 1 block duration
    const auctionId = await startAuction(minterPrivateKey, nftKey, UInt64.from(1));

    // Produce another block to end auction
    await appChain.produceBlock();

    // Try to place bid after auction ended
    appChain.setSigner(alicePrivateKey);
    const tx = await appChain.transaction(alice, async () => {
      await auction.placeBid(auctionId, UInt64.from(500));
    });
    await tx.sign();
    await tx.send();
    const block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(false);
  });

  it("should return bid amount to previous bidder when outbid", async () => {
    const minterPrivateKey = PrivateKey.random();
    const minter = minterPrivateKey.toPublicKey();
    
    // Mint NFT
    const nftKey = await mintTestNFT(minterPrivateKey);
    
    // Start auction
    const auctionId = await startAuction(minterPrivateKey, nftKey, UInt64.from(10));

    const aliceBalanceBeforeBid = await balanceQuery.balances.get(
      BalancesKey.from(GAS_TOKEN_ID, alice)
    );

    // First bid from Alice
    appChain.setSigner(alicePrivateKey);
    let tx = await appChain.transaction(alice, async () => {
      await auction.placeBid(auctionId, UInt64.from(500));
    });
    await tx.sign();
    await tx.send();
    let block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);

    // Higher bid from Bob
    appChain.setSigner(bobPrivateKey);
    tx = await appChain.transaction(bob, async () => {
      await auction.placeBid(auctionId, UInt64.from(600));
    });
    await tx.sign();
    await tx.send();
    block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);

    // Check if Alice got her bid amount back
    const aliceBalanceAfter = await balanceQuery.balances.get(
      BalancesKey.from(GAS_TOKEN_ID, alice)
    );
    const bobBalanceAfter = await balanceQuery.balances.get(
      BalancesKey.from(GAS_TOKEN_ID, bob)
    );

    expect(aliceBalanceAfter?.toBigInt()).toBe(aliceBalanceBeforeBid?.toBigInt());
    expect(bobBalanceAfter?.toBigInt()).toBe(400n);

  });
});
