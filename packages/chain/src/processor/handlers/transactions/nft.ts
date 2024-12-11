import { BlockHandler } from "@proto-kit/processor";
import { PrismaClient } from "@prisma/client-processor";
import { appChain } from "../../utils/app-chain";
import { MethodParameterEncoder } from "@proto-kit/module";
import { Block, TransactionExecutionResult } from "@proto-kit/sequencer";
import { Field, PublicKey, UInt32 } from "o1js";
import { NFTKey, FixedString } from "../../../runtime/modules/nfts";

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
  await nftDataExtractor(metadata.toString()).then(async({ nftData, collectionData }) => {    
    // Check if collection exists, if not create it
    let collection = await client.nftCollection.findUnique({
      where: { address: sender.toBase58() }
    });
  
    if (!collection) {
      collection = await client.nftCollection.create({
        data: {
          address: sender.toBase58(),
          nftCount: 1,
          ...collectionData
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
        metadata: metadata.toString(),
        ...nftData
      }
    });
  
    console.log(`
      NFT minted:
      - collection: ${sender.toBase58()}
      - to: ${to.toBase58()}
      - onchain metadata: ${metadata.toString()}
      - data: ${nftData.data}
    `);
  })
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

async function nftDataExtractor(metaDataString: string): Promise<{
  nftData: {
    data: string;
    name?: string;
    imgUrl?: string;
  };
  collectionData: {
    name?: string;
    description?: string;
  };
}> {
  let url: string;
  if(metaDataString.startsWith("ipfs://")) {
    url = metaDataString.replace("ipfs://", "https://ipfs.io/ipfs/");
  } else if(metaDataString.startsWith("ipns://")) {
    url = metaDataString.replace("ipns://", "https://ipfs.io/ipns/");
  } else if(metaDataString.startsWith("http")) {
    url = metaDataString;
  } else { // its a hash
    url = `https://ipfs.io/ipfs/${metaDataString}`;
  }

  const metaData = await getJson(url);
  const nftData: any = {
    data: JSON.stringify(metaData),
  };
  const collectionData: any = {};
  // use best effort to extract data from the json

  // NFT
  if(metaData.name) {
    nftData.name = metaData.name;
  }
  if(metaData.image) {
    nftData.imgUrl = metaData.image;
  } else if(metaData.imageUrl) {
    nftData.imgUrl = metaData.imageUrl;
  }

  // Collection
  if(metaData.collection_name) {
    collectionData.name = metaData.collection_name;
  } else if((metaData.name as string).includes("#") ) {
    collectionData.name = (metaData.name as string).split("#")[0].trim();
  } else {
    collectionData.name = (metaData.name as string).split(" ")[0].trim();
  }
  if(metaData.description) {
    collectionData.description = metaData.description;
  }

  return { nftData, collectionData };
}

async function getJson(url: string) {
  const maxRetries = 3;
  let attempt = 1;

  const tryFetch = async (): Promise<any> => {
    try {
      const response = await fetch(url);
      if (response.status === 200) {
        return await response.json();
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed for ${url}:`, error);
      if (attempt < maxRetries) {
        attempt++;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(tryFetch());
          }, 1000 * attempt); // Exponential backoff
        });
      }
      console.log(`All ${maxRetries} attempts failed for ${url}`);
      return undefined;
    }
  };

  return tryFetch();
}