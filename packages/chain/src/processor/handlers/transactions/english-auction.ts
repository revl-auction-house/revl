import { BlockHandler } from "@proto-kit/processor";
import { PrismaClient } from "@prisma/client-processor";
import { appChain } from "../../utils/app-chain";
import { MethodParameterEncoder } from "@proto-kit/module";
import { Block, TransactionExecutionResult } from "@proto-kit/sequencer";
import { Field, PublicKey } from "o1js";
import { NFTKey } from "../../../runtime/modules/nfts";
import { UInt64 } from "@proto-kit/library";
import { getAuctionId } from "../../../runtime/modules/Auctions/Auction";

export const handleEnglishAuctionStart = async (
  client: Parameters<BlockHandler<PrismaClient>>[0],
  block: Block,
  tx: TransactionExecutionResult
) => {
  const module = appChain.runtime.resolve("EnglishAuctionModule");
  const parameterDecoder = MethodParameterEncoder.fromMethod(module, "start");

  // @ts-expect-error
  const [nftKey, duration]: [NFTKey, UInt64] = await parameterDecoder.decode(
    tx.tx.argsFields,
    tx.tx.auxiliaryData
  );

  const startTime = Number(block.height.toString());
  const endTime = startTime + Number(duration.toString());
  const auctionId = getAuctionId(UInt64.Unsafe.fromField(block.height), nftKey);

  // Create auction
  await client.englishAuction.create({
    data: {
      id: auctionId.toString(),
      nftCollection: nftKey.collection.toBase58(),
      nftId: Number(nftKey.id.toBigint()),
      creator: tx.tx.sender.toBase58(),
      ended: false,
      startTime,
      endTime,
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
      lastAuctionType: "ENGLISH",
      locked: true
    }
  });

  console.log(`
    English Auction started:
    - id: ${auctionId.toString()}
    - collection: ${nftKey.collection.toBase58()}
    - nftId: ${nftKey.id.toBigint()}
    - creator: ${tx.tx.sender.toBase58()}
    - startTime: ${startTime}
    - endTime: ${endTime}
  `);
};

export const handleEnglishAuctionPlaceBid = async (
  client: Parameters<BlockHandler<PrismaClient>>[0],
  block: Block,
  tx: TransactionExecutionResult
) => {
  const module = appChain.runtime.resolve("EnglishAuctionModule");
  const parameterDecoder = MethodParameterEncoder.fromMethod(module, "placeBid");

  // @ts-expect-error
  const [auctionId, bid]: [Field, UInt64] = await parameterDecoder.decode(
    tx.tx.argsFields,
    tx.tx.auxiliaryData
  );

  const bidder = tx.tx.sender.toBase58();

  // Create bid
  await client.bid.create({
    data: {
      bidder,
      amount: bid.toString(),
      auctionId: auctionId.toString()
    }
  });

  console.log(`
    Bid placed:
    - auction: ${auctionId.toString()}
    - bidder: ${bidder}
    - amount: ${bid.toString()}
  `);
};

export const handleEnglishAuctionEnd = async (
  client: Parameters<BlockHandler<PrismaClient>>[0],
  block: Block,
  tx: TransactionExecutionResult
) => {
  const module = appChain.runtime.resolve("EnglishAuctionModule");
  const parameterDecoder = MethodParameterEncoder.fromMethod(module, "end");

  // @ts-expect-error
  const [auctionId]: [Field] = await parameterDecoder.decode(
    tx.tx.argsFields,
    tx.tx.auxiliaryData
  );

  // Get highest bid
  const highestBid = await client.bid.findFirst({
    where: { auctionId: auctionId.toString() },
    orderBy: { amount: 'desc' }
  });

  // Update auction
  await client.englishAuction.update({
    where: { id: auctionId.toString() },
    data: {
      ended: true,
      winner: highestBid?.bidder ?? ""
    }
  });

  // Get auction details to unlock NFT
  const auction = await client.englishAuction.findUnique({
    where: { id: auctionId.toString() }
  });

  if (auction) {
    // Update NFT
    await client.nft.update({
      where: {
        collectionAddress_id: {
          collectionAddress: auction.nftCollection,
          id: auction.nftId
        }
      },
      data: {
        locked: false,
        owner: highestBid?.bidder ?? auction.creator // If no bids, return to creator
      }
    });
  }

  console.log(`
    English Auction ended:
    - id: ${auctionId.toString()}
    - winner: ${highestBid?.bidder ?? 'No winner (returned to creator)'}
    - winning bid: ${highestBid?.amount ?? '0'}
  `);
};
