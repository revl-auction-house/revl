import { runtimeModule, RuntimeModule, state } from "@proto-kit/module";
import { Bool, PublicKey, Struct, Field, Poseidon, Provable } from "o1js";
import { inject } from "tsyringe";
import { NFT, NFTKey } from "../nfts";
import { StateMap, assert } from "@proto-kit/protocol";
import { UInt64 } from "@proto-kit/library";

export const BaseAuctionData = {
  nftKey: NFTKey,
  creator: PublicKey,
  winner: PublicKey, // default value empty
  ended: Bool,
};

export class Auction extends Struct(BaseAuctionData) {}

export function getAuctionId(blockHeight: UInt64, nftKey: NFTKey): Field {
  return Poseidon.hash([
    ...blockHeight.toO1UInt64().toFields(),
    ...nftKey.collection.toFields(),
    ...nftKey.id.toFields(),
  ]);
}

export abstract class AuctionModule<
  A extends Auction,
> extends RuntimeModule<{}> {
  @state() public records!: StateMap<Field, A>;

  public constructor(@inject("NFT") public nfts: NFT) {
    super();
  }


  /**
   * checks owner, updates record, locks nft
   * @param auction
   */
  public async createAuction(auction: A): Promise<Field> {
    const auctionId = getAuctionId(new UInt64(this.network.block.height), auction.nftKey);
    // Provable.asProver(() => {
    //   console.log("auctionId", auctionId.toString(), "block height", this.network.block.height.toString());
    // });
    await this.records.set(auctionId, auction);
    const { value: nft, isSome } = await this.nfts.nftRecords.get(
      auction.nftKey
    );
    assert(isSome, "nft does not exists");
    await this.nfts.assertAddressOwner(
      auction.nftKey,
      this.transaction.sender.value
    );
    // check if the nft is unlocked
    await this.nfts.assertUnLocked(auction.nftKey);
    // lock the nft
    await this.nfts.lock(auction.nftKey);

    return auctionId;
  }

  /**
   * Ends auction, transfer nft to winner and unlocks it
   * @param id
   * @param winner
   */
  public async endAuction(id: Field, winner: PublicKey) {
    assert(winner.isEmpty().not(), "Winner cannot be empty");
    const { value: auction, isSome } = await this.records.get(id);
    assert(isSome, "no auctions exists");
    await this.records.set(id, { ...auction, ended: Bool(true), winner });
    // transfer the nft to new owner
    await this.nfts.transfer(winner, auction.nftKey);
    // unlock the nft
    await this.nfts.unlock(auction.nftKey);
  }
}
