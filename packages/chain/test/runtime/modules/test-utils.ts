import { PrivateKey, Poseidon, Encoding, Field } from "o1js";
import { TestingAppChain } from "@proto-kit/sdk";
import { UInt32, UInt64 } from "@proto-kit/library";
import { NFT, NFTKey } from "../../../src/runtime/modules/nfts";
import { AuctionModule } from "../../../src/runtime/modules/Auctions/Auction";
import { getAuctionId } from "../../../src/runtime/modules/Auctions/Auction";

export const mintTestNFT = async (
  appChain: TestingAppChain,
  owner: PrivateKey,
  nfts: NFT
): Promise<NFTKey> => {
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
  if (!block?.transactions[0].status.toBoolean()) {
    throw new Error(`Failed to mint NFT: ${block?.transactions[0].statusMessage}`);
  }

  return NFTKey.from(owner.toPublicKey(), UInt32.from(0));
};

export const startAuction = async (
  appChain: TestingAppChain,
  auction: AuctionModule<any>,
  minterPrivateKey: PrivateKey,
  nftKey: NFTKey,
  ...startParams: any[]
): Promise<Field> => {
  const blockHeight = new UInt64((await appChain.query.network.unproven)?.block.height ?? UInt64.from(0));
  const auctionId = getAuctionId(blockHeight.add(UInt64.from(1)), nftKey);

  appChain.setSigner(minterPrivateKey);
  const tx = await appChain.transaction(minterPrivateKey.toPublicKey(), async () => {
    await auction.start(nftKey, ...startParams);
  });
  await tx.sign();
  await tx.send();
  const block = await appChain.produceBlock();
  if (!block?.transactions[0].status.toBoolean()) {
    throw new Error(`Failed to start auction: ${block?.transactions[0].statusMessage}`);
  }

  return auctionId;
};
