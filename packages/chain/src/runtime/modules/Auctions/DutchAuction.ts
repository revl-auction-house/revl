import {
  runtimeMethod,
  runtimeModule,
  RuntimeModule,
  state,
} from "@proto-kit/module";
import { Bool, Field, Poseidon, Provable, PublicKey, Struct } from "o1js";
import { inject } from "tsyringe";
import { NFT, NFTKey } from "../nfts";
import { StateMap, assert } from "@proto-kit/protocol";
import { AuctionModule, BaseAuctionData } from "./Auction";
import { Balances } from "../balances";
import { Balance, UInt64 } from "@proto-kit/library";

export class DutchAuction extends Struct({
  ...BaseAuctionData,
  startPrice: UInt64,
  minPrice: UInt64,
  decayRate: UInt64,
  startTime: UInt64,
}) {}
/**
 * In Dutch Auction aka descending price auction,
 * starts with a high price,
 * incrementally lowering the price until someone places a bid.
 */
@runtimeModule()
export class DutchAuctionModule extends AuctionModule<DutchAuction> {
  public constructor(
    @inject("NFT") public nfts: NFT,
    @inject("Balances") public balances: Balances
  ) {
    super(nfts);
    this.records = StateMap.from<Field, DutchAuction>(Field, DutchAuction);
  }

  @runtimeMethod()
  public async start(
    nftKey: NFTKey,
    startPrice: UInt64,
    decayRate: UInt64,
    minPrice: UInt64 = UInt64.zero
  ): Promise<Field> {
    const auction = new DutchAuction({
      nftKey,
      creator: this.transaction.sender.value,
      winner: PublicKey.empty(),
      ended: Bool(false),
      startPrice,
      startTime: new UInt64(this.network.block.height),
      decayRate,
      minPrice,
    });
    assert(auction.startPrice.greaterThan(auction.minPrice), "Invalid price");
    return await this.createAuction(auction);
  }

  /**
   * The first bid ends the auction
   * @param auctionId
   */
  @runtimeMethod()
  public async bid(auctionId: Field) {
    const { value: auction, isSome } = await this.records.get(auctionId);
    assert(isSome, "no auctions exists");
    const blockHeight = new UInt64(this.network.block.height);
    const decay = new UInt64(
      Provable.if(
        blockHeight.equals(UInt64.from(0)),
        UInt64,
        blockHeight.add(auction.startTime),
        blockHeight
      )
    )
      .sub(auction.startTime)
      .mul(auction.decayRate);

    const finalPrice = Provable.if(
      decay.greaterThan(auction.startPrice.sub(auction.minPrice)),
      UInt64,
      auction.minPrice,
      auction.startPrice.sub(decay)
    );

    await this.balances.transferFrom(
      this.transaction.sender.value,
      auction.creator,
      Balance.from(new UInt64(finalPrice))
    );
    await this.endAuction(auctionId, this.transaction.sender.value);
  }
}
