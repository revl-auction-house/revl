import { runtimeMethod, runtimeModule, state } from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { Bool, Encoding, Field, Poseidon, PublicKey, Struct } from "o1js";
import { inject } from "tsyringe";
import { NFT, NFTKey } from "../nfts";
import { Balances } from "../balances";
import { AuctionModule, BaseAuctionData } from "./Auction";
import { UInt64 } from "@proto-kit/library";

export class Bids extends Struct({
  bidder: PublicKey,
  price: UInt64,
}) {}

export class EnglishAuction extends Struct({
  ...BaseAuctionData,
  startTime: UInt64,
  endTime: UInt64,
  maxBid: Bids,
}) {}

@runtimeModule()
export class EnglishAuctionModule extends AuctionModule<EnglishAuction> {
  public readonly ADDRESS = PublicKey.from({
    x: Poseidon.hash(Encoding.stringToFields("EnglishAuction")),
    isOdd: Bool(false),
  });

  @state() public records: StateMap<Field, EnglishAuction>;

  public constructor(
    @inject("NFT") public nfts: NFT,
    @inject("Balances") public balances: Balances
  ) {
    super(nfts);
    this.records = StateMap.from<Field, EnglishAuction>(Field, EnglishAuction);
  }

  /**
   * @param nftKey
   * @param duration `placeBid` possible in the next `duration` blocks
   */
  @runtimeMethod()
  public async start(nftKey: NFTKey, duration: UInt64): Promise<Field> {
    // TODO is duration > buffer required
    const auction = new EnglishAuction({
      nftKey,
      creator: this.transaction.sender.value,
      winner: PublicKey.empty(),
      ended: Bool(false),
      startTime: new UInt64(this.network.block.height),
      endTime: new UInt64(this.network.block.height).add(duration),
      maxBid: new Bids({
        bidder: this.transaction.sender.value,
        price: UInt64.zero,
      }),
    });
    return await this.createAuction(auction);
  }

  @runtimeMethod()
  public async placeBid(auctionId: Field, bid: UInt64) {
    const { value: auction, isSome } = await this.records.get(auctionId);
    assert(isSome, "no auctions exists");
    const currentBid = new Bids({
      bidder: this.transaction.sender.value,
      price: bid,
    });
    assert(
      currentBid.price.greaterThan(auction.maxBid.price),
      "Bid must be higher than previous bid"
    );
    assert(
      auction.endTime
        .greaterThanOrEqual(new UInt64(this.network.block.height))
        .and(auction.ended.not()),
      "Auction has ended"
    );
    // lock bidders amount
    await this.balances.transferFrom(this.transaction.sender.value, this.ADDRESS, bid);
    // we return the earlier bidders locked amount
    await this.balances.transferFrom(
      this.ADDRESS,
      auction.maxBid.bidder,
      auction.maxBid.price
    );
    // update maxBids
    await this.records.set(auctionId, { ...auction, maxBid: currentBid });
  }

  /**
   * Anyone can call this after auction endTime
   * maxBidder gets the nft and
   * auction creator gets the bid
   */
  @runtimeMethod()
  public async end(id: Field) {
    const { value: auction, isSome } = await this.records.get(id);
    assert(isSome, "no auctions exists");
    assert(
      auction.endTime
        .lessThan(new UInt64(this.network.block.height))
        .and(auction.ended.not()),
      "Wait till auction ends"
    );
    // transfer the locked token amount to seller or auction creator
    await this.balances.transferFrom(
      this.ADDRESS,
      auction.creator,
      auction.maxBid.price
    );
    // end auction
    await this.endAuction(id, auction.maxBid.bidder);
  }
}
