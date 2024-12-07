import { TestingAppChain } from "@proto-kit/sdk";
import { Poseidon, PrivateKey, UInt32, Field } from "o1js";
import { FixedString, NFT, NFTKey } from "../../../src/runtime/modules/nfts";
import { log } from "@proto-kit/common";
import { Balances } from "../../../src/runtime/modules/balances";

log.setLevel("ERROR");

describe("NFT", () => {
  it("should be able to mint & transfer NFTs", async () => {
    // Initialize the test chain
    const appChain = TestingAppChain.fromRuntime({
      Balances,
      NFT,
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {},
        NFT: {},
      },
    });

    await appChain.start();

    // Setup test accounts
    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();

    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    const minterPrivateKey = PrivateKey.random();
    const minter = minterPrivateKey.toPublicKey();

    const nft = appChain.runtime.resolve("NFT");

    // Create sample NFT metadata
    const nftMetadata = FixedString.fromString("ipfs://Qm...");

    // Test minting NFTs
    appChain.setSigner(minterPrivateKey);

    // Mint first NFT to minter
    const tx1 = await appChain.transaction(minter, async () => {
      await nft.mint(minter, nftMetadata);
    });
    await tx1.sign();
    await tx1.send();
    let block = await appChain.produceBlock();

    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);

    // Mint second NFT to Alice
    const tx2 = await appChain.transaction(minter, async () => {
      await nft.mint(alice, nftMetadata);
    });
    await tx2.sign();
    await tx2.send();
    await appChain.produceBlock();

    // Test transferring NFT from minter to Bob
    const tx3 = await appChain.transaction(minter, async () => {
      await nft.transferSigned(bob, NFTKey.from(minter, UInt32.from(0)));
    });
    await tx3.sign();
    await tx3.send();
    block = await appChain.produceBlock();

    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);

    // Verify final ownership
    const nft1key = NFTKey.from(minter, UInt32.from(0));
    const nft2key = NFTKey.from(minter, UInt32.from(1));

    const nft1 = await appChain.query.runtime.NFT.nftRecords.get(nft1key);
    const nft2 = await appChain.query.runtime.NFT.nftRecords.get(nft2key);

    expect(nft1?.owner.toBase58()).toBe(bob.toBase58());
    expect(nft2?.owner.toBase58()).toBe(alice.toBase58());
  }, 60_000);
});
