import { Balance, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

import { Balances } from "./modules/balances";
import { NFT } from "./modules/nfts";
import { EnglishAuctionModule } from "./modules/Auctions/EnglishAuction";
import { DutchAuction, DutchAuctionModule } from "./modules/Auctions/DutchAuction";

export const modules = VanillaRuntimeModules.with({
  Balances,
  NFT,
  EnglishAuctionModule,
  DutchAuctionModule
});

export const config: ModulesConfig<typeof modules> = {
  Balances: {  },
  NFT: {},
  EnglishAuctionModule: {},
  DutchAuctionModule: {},
};

export default {
  modules,
  config,
};
