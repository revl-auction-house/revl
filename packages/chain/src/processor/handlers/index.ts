import { BlockHandler, HandlersRecord } from "@proto-kit/processor";
import { PrismaClient } from "@prisma/client-processor";
import { appChain } from "./../utils/app-chain";
import { handleBalancesAddBalance } from "./transactions/add-balance";
import { handleNFTMint, handleNFTTransfer } from "./transactions/nft";
import { handleEnglishAuctionStart, handleEnglishAuctionPlaceBid, handleEnglishAuctionEnd } from "./transactions/english-auction";
import { handleDutchAuctionStart, handleDutchAuctionBid } from "./transactions/dutch-auction";

const handleTransactions: BlockHandler<PrismaClient> = async (
  client,
  { block, result: blockResult }
) => {
  // iterate over all transactions
  for (const tx of block.transactions) {
    const methodId = tx.tx.methodId.toBigInt();

    const methodDescriptor =
      appChain.runtime.methodIdResolver.getMethodNameFromId(methodId);

    if (methodDescriptor === undefined) {
      throw new Error("Unable to retrieve the method descriptor");
    }

    const moduleName = methodDescriptor[0];
    const methodName = methodDescriptor[1];

    // eslint-disable-next-line sonarjs/no-small-switch, default-case
    switch (moduleName) {
      case "Balances":
        // eslint-disable-next-line max-len
        // eslint-disable-next-line sonarjs/no-small-switch, default-case, sonarjs/no-nested-switch
        switch (methodName) {
          case "addBalance":
            await handleBalancesAddBalance(client, block, tx);
            break;
        }
        break;
      case "NFT":
        switch (methodName) {
          case "mint":
            await handleNFTMint(client, block, tx);
            break;
          case "transferSigned":
            await handleNFTTransfer(client, block, tx);
            break;
        }
        break;
      case "EnglishAuctionModule":
        switch (methodName) {
          case "start":
            await handleEnglishAuctionStart(client, block, tx);
            break;
          case "placeBid":
            await handleEnglishAuctionPlaceBid(client, block, tx);
            break;
          case "end":
            await handleEnglishAuctionEnd(client, block, tx);
            break;
        }
        break;
      case "DutchAuctionModule":
        switch (methodName) {
          case "start":
            await handleDutchAuctionStart(client, block, tx);
            break;
          case "bid":
            await handleDutchAuctionBid(client, block, tx);
            break;
        }
    }
  }
};

export const handlers: HandlersRecord<PrismaClient> = {
  onBlock: [handleTransactions],
};
