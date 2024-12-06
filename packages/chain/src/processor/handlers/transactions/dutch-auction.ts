import { BlockHandler } from "@proto-kit/processor";
import { PrismaClient } from "@prisma/client-processor";
import { appChain } from "../../utils/app-chain";
import { MethodParameterEncoder } from "@proto-kit/module";
import { Block, TransactionExecutionResult } from "@proto-kit/sequencer";
import { Field, PublicKey } from "o1js";
import { NFTKey } from "../../../runtime/modules/nfts";
import { UInt64 } from "@proto-kit/library";
import { randomUUID } from "crypto";
import { getAuctionId } from "../../../runtime/modules/Auctions/Auction";

export const handleDutchAuctionStart = async (
  client: Parameters<BlockHandler<PrismaClient>>[0],
  block: Block,
  tx: TransactionExecutionResult
) => {
  const module = appChain.runtime.resolve("DutchAuctionModule");
  const parameterDecoder = MethodParameterEncoder.fromMethod(module, "start");

  // @ts-expect-error
  const [nftKey, startPrice, decayRate, minPrice]: [
    NFTKey,
    UInt64,
    UInt64,
    UInt64
  ] = await parameterDecoder.decode(tx.tx.argsFields, tx.tx.auxiliaryData);

  const startTime = Number(block.height.toString());
  const auctionId = getAuctionId(UInt64.Unsafe.fromField(block.height), nftKey);
  

  // Create auction
  await client.dutchAuction.create({
    data: {
      id: auctionId.toString(),
      nftCollection: nftKey.collection.toBase58(),
      nftId: Number(nftKey.id.toBigint()),
      creator: tx.tx.sender.toBase58(),
      ended: false,
      startPrice: startPrice.toString(),
      minPrice: minPrice.toString(),
      decayRate: decayRate.toString(),
      startTime,
    }
  });

  // Update NFT with auction reference
  await client.nft.update({
    where: {
      collectionAddress_id: {
        collectionAddress: nftKey.collection.toBase58(),
        id: Number(nftKey.id.toBigint())
      }
    },
    data: {
      lastAuctionId: auctionId.toString(),
      lastAuctionType: "DUTCH",
      locked: true
    }
  });

  console.log(`
    Dutch Auction started:
    - id: ${auctionId}
    - collection: ${nftKey.collection.toBase58()}
    - nftId: ${nftKey.id.toBigint()}
    - creator: ${tx.tx.sender.toBase58()}
    - startPrice: ${startPrice.toString()}
    - minPrice: ${minPrice.toString()}
    - decayRate: ${decayRate.toString()}
    - startTime: ${startTime}
  `);
};

export const handleDutchAuctionBid = async (
  client: Parameters<BlockHandler<PrismaClient>>[0],
  block: Block,
  tx: TransactionExecutionResult
) => {
  const module = appChain.runtime.resolve("DutchAuctionModule");
  const parameterDecoder = MethodParameterEncoder.fromMethod(module, "bid");

  // @ts-expect-error
  const [auctionId]: [Field] = await parameterDecoder.decode(
    tx.tx.argsFields,
    tx.tx.auxiliaryData
  );

  const bidder = tx.tx.sender.toBase58();
  const blockHeight = Number(block.height.toString());

  // Get auction
  const auction = await client.dutchAuction.findUnique({
    where: { id: auctionId.toString() }
  });

  if (!auction) {
    throw new Error(`Auction ${auctionId.toString()} not found`);
  }

  // Calculate current price based on decay rate
  const elapsedBlocks = blockHeight - auction.startTime;
  const priceDecay = BigInt(elapsedBlocks) * BigInt(auction.decayRate);
  const currentPrice = BigInt(auction.startPrice) - priceDecay;
  const finalPrice = currentPrice > BigInt(auction.minPrice) ? currentPrice.toString() : auction.minPrice;

  // Update auction as ended with winner
  await client.dutchAuction.update({
    where: { id: auctionId.toString() },
    data: {
      ended: true,
      winner: bidder,
      finalPrice
    }
  });

  // Update NFT ownership
  await client.nft.update({
    where: {
      collectionAddress_id: {
        collectionAddress: auction.nftCollection,
        id: auction.nftId
      }
    },
    data: {
      locked: false,
      owner: bidder
    }
  });

  console.log(`
    Dutch Auction ended with bid:
    - id: ${auctionId.toString()}
    - winner: ${bidder}
    - final price: ${finalPrice}
    - timestamp: ${blockHeight}
  `);
};
