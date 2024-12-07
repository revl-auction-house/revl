import { BlockHandler } from "@proto-kit/processor";
import { PrismaClient } from "@prisma/client-processor";
import { appChain } from "../../utils/app-chain";
import { MethodParameterEncoder } from "@proto-kit/module";
import { Block, TransactionExecutionResult } from "@proto-kit/sequencer";
import { Field, PublicKey, UInt32 } from "o1js";
import { NFTKey } from "../../../runtime/modules/nfts";

export const handleNFTMint = async (
  client: Parameters<BlockHandler<PrismaClient>>[0],
  block: Block,
  tx: TransactionExecutionResult
) => {
  const module = appChain.runtime.resolve("NFT");
  const parameterDecoder = MethodParameterEncoder.fromMethod(module, "mint");

  // @ts-expect-error
  const [to, metadata]: [PublicKey, FixedString] = await parameterDecoder.decode(
    tx.tx.argsFields,
    tx.tx.auxiliaryData
  );

  const sender = tx.tx.sender;

  // try to extract data from hash (ipfs, ...)
  // TODO: implement a retry job if extraction fails / timeouts
  // const {nftData, collectionData} = await nftDataExtractor(hash);
  
  // Check if collection exists, if not create it
  let collection = await client.nftCollection.findUnique({
    where: { address: sender.toBase58() }
  });

  if (!collection) {
    collection = await client.nftCollection.create({
      data: {
        address: sender.toBase58(),
        nftCount: 1
      }
    });
  } else {
    // Increment nftCount for existing collection
    collection = await client.nftCollection.update({
      where: { address: sender.toBase58() },
      data: { nftCount: { increment: 1 } }
    });
  }

  // Create NFT with collection's current nftCount as id
  await client.nft.create({
    data: {
      id: collection?.nftCount ?? 0,
      collectionAddress: sender.toBase58(),
      owner: to.toBase58(),
      locked: false,
      dataHash: metadata.toString(),
      data: "", // TODO
    }
  });

  console.log(`
    NFT minted:
    - collection: ${sender.toBase58()}
    - to: ${to.toBase58()}
    - hash: ${metadata.toString()}
  `);
};

export const handleNFTTransfer = async (
  client: Parameters<BlockHandler<PrismaClient>>[0],
  block: Block,
  tx: TransactionExecutionResult
) => {
  const module = appChain.runtime.resolve("NFT");
  const parameterDecoder = MethodParameterEncoder.fromMethod(
    module,
    "transferSigned"
  );

  // @ts-expect-error
  const [to, nftKey]: [PublicKey, NFTKey] = await parameterDecoder.decode(
    tx.tx.argsFields,
    tx.tx.auxiliaryData
  );

  // Update NFT owner
  await client.nft.update({
    where: {
      collectionAddress_id: {
        collectionAddress: nftKey.collection.toBase58(),
        id: Number(nftKey.id.toBigint())
      }
    },
    data: {
      owner: to.toBase58()
    }
  });
};
