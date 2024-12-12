import { ClassType } from "type-graphql";
import * as tslib from "tslib";
import * as crudResolvers from "./resolvers/crud/resolvers-crud.index";
import * as argsTypes from "./resolvers/crud/args.index";
import * as actionResolvers from "./resolvers/crud/resolvers-actions.index";
import * as relationResolvers from "./resolvers/relations/resolvers.index";
import * as models from "./models";
import * as outputTypes from "./resolvers/outputs";
import * as inputTypes from "./resolvers/inputs";

export type MethodDecoratorOverrideFn = (decorators: MethodDecorator[]) => MethodDecorator[];

const crudResolversMap = {
  Block: crudResolvers.BlockCrudResolver,
  Balance: crudResolvers.BalanceCrudResolver,
  NftCollection: crudResolvers.NftCollectionCrudResolver,
  Nft: crudResolvers.NftCrudResolver,
  Bid: crudResolvers.BidCrudResolver,
  EnglishAuction: crudResolvers.EnglishAuctionCrudResolver,
  DutchAuction: crudResolvers.DutchAuctionCrudResolver
};
const actionResolversMap = {
  Block: {
    aggregateBlock: actionResolvers.AggregateBlockResolver,
    createManyBlock: actionResolvers.CreateManyBlockResolver,
    createManyAndReturnBlock: actionResolvers.CreateManyAndReturnBlockResolver,
    createOneBlock: actionResolvers.CreateOneBlockResolver,
    deleteManyBlock: actionResolvers.DeleteManyBlockResolver,
    deleteOneBlock: actionResolvers.DeleteOneBlockResolver,
    findFirstBlock: actionResolvers.FindFirstBlockResolver,
    findFirstBlockOrThrow: actionResolvers.FindFirstBlockOrThrowResolver,
    blocks: actionResolvers.FindManyBlockResolver,
    block: actionResolvers.FindUniqueBlockResolver,
    getBlock: actionResolvers.FindUniqueBlockOrThrowResolver,
    groupByBlock: actionResolvers.GroupByBlockResolver,
    updateManyBlock: actionResolvers.UpdateManyBlockResolver,
    updateOneBlock: actionResolvers.UpdateOneBlockResolver,
    upsertOneBlock: actionResolvers.UpsertOneBlockResolver
  },
  Balance: {
    aggregateBalance: actionResolvers.AggregateBalanceResolver,
    createManyBalance: actionResolvers.CreateManyBalanceResolver,
    createManyAndReturnBalance: actionResolvers.CreateManyAndReturnBalanceResolver,
    createOneBalance: actionResolvers.CreateOneBalanceResolver,
    deleteManyBalance: actionResolvers.DeleteManyBalanceResolver,
    deleteOneBalance: actionResolvers.DeleteOneBalanceResolver,
    findFirstBalance: actionResolvers.FindFirstBalanceResolver,
    findFirstBalanceOrThrow: actionResolvers.FindFirstBalanceOrThrowResolver,
    balances: actionResolvers.FindManyBalanceResolver,
    balance: actionResolvers.FindUniqueBalanceResolver,
    getBalance: actionResolvers.FindUniqueBalanceOrThrowResolver,
    groupByBalance: actionResolvers.GroupByBalanceResolver,
    updateManyBalance: actionResolvers.UpdateManyBalanceResolver,
    updateOneBalance: actionResolvers.UpdateOneBalanceResolver,
    upsertOneBalance: actionResolvers.UpsertOneBalanceResolver
  },
  NftCollection: {
    aggregateNftCollection: actionResolvers.AggregateNftCollectionResolver,
    createManyNftCollection: actionResolvers.CreateManyNftCollectionResolver,
    createManyAndReturnNftCollection: actionResolvers.CreateManyAndReturnNftCollectionResolver,
    createOneNftCollection: actionResolvers.CreateOneNftCollectionResolver,
    deleteManyNftCollection: actionResolvers.DeleteManyNftCollectionResolver,
    deleteOneNftCollection: actionResolvers.DeleteOneNftCollectionResolver,
    findFirstNftCollection: actionResolvers.FindFirstNftCollectionResolver,
    findFirstNftCollectionOrThrow: actionResolvers.FindFirstNftCollectionOrThrowResolver,
    nftCollections: actionResolvers.FindManyNftCollectionResolver,
    nftCollection: actionResolvers.FindUniqueNftCollectionResolver,
    getNftCollection: actionResolvers.FindUniqueNftCollectionOrThrowResolver,
    groupByNftCollection: actionResolvers.GroupByNftCollectionResolver,
    updateManyNftCollection: actionResolvers.UpdateManyNftCollectionResolver,
    updateOneNftCollection: actionResolvers.UpdateOneNftCollectionResolver,
    upsertOneNftCollection: actionResolvers.UpsertOneNftCollectionResolver
  },
  Nft: {
    aggregateNft: actionResolvers.AggregateNftResolver,
    createManyNft: actionResolvers.CreateManyNftResolver,
    createManyAndReturnNft: actionResolvers.CreateManyAndReturnNftResolver,
    createOneNft: actionResolvers.CreateOneNftResolver,
    deleteManyNft: actionResolvers.DeleteManyNftResolver,
    deleteOneNft: actionResolvers.DeleteOneNftResolver,
    findFirstNft: actionResolvers.FindFirstNftResolver,
    findFirstNftOrThrow: actionResolvers.FindFirstNftOrThrowResolver,
    nfts: actionResolvers.FindManyNftResolver,
    nft: actionResolvers.FindUniqueNftResolver,
    getNft: actionResolvers.FindUniqueNftOrThrowResolver,
    groupByNft: actionResolvers.GroupByNftResolver,
    updateManyNft: actionResolvers.UpdateManyNftResolver,
    updateOneNft: actionResolvers.UpdateOneNftResolver,
    upsertOneNft: actionResolvers.UpsertOneNftResolver
  },
  Bid: {
    aggregateBid: actionResolvers.AggregateBidResolver,
    createManyBid: actionResolvers.CreateManyBidResolver,
    createManyAndReturnBid: actionResolvers.CreateManyAndReturnBidResolver,
    createOneBid: actionResolvers.CreateOneBidResolver,
    deleteManyBid: actionResolvers.DeleteManyBidResolver,
    deleteOneBid: actionResolvers.DeleteOneBidResolver,
    findFirstBid: actionResolvers.FindFirstBidResolver,
    findFirstBidOrThrow: actionResolvers.FindFirstBidOrThrowResolver,
    bids: actionResolvers.FindManyBidResolver,
    bid: actionResolvers.FindUniqueBidResolver,
    getBid: actionResolvers.FindUniqueBidOrThrowResolver,
    groupByBid: actionResolvers.GroupByBidResolver,
    updateManyBid: actionResolvers.UpdateManyBidResolver,
    updateOneBid: actionResolvers.UpdateOneBidResolver,
    upsertOneBid: actionResolvers.UpsertOneBidResolver
  },
  EnglishAuction: {
    aggregateEnglishAuction: actionResolvers.AggregateEnglishAuctionResolver,
    createManyEnglishAuction: actionResolvers.CreateManyEnglishAuctionResolver,
    createManyAndReturnEnglishAuction: actionResolvers.CreateManyAndReturnEnglishAuctionResolver,
    createOneEnglishAuction: actionResolvers.CreateOneEnglishAuctionResolver,
    deleteManyEnglishAuction: actionResolvers.DeleteManyEnglishAuctionResolver,
    deleteOneEnglishAuction: actionResolvers.DeleteOneEnglishAuctionResolver,
    findFirstEnglishAuction: actionResolvers.FindFirstEnglishAuctionResolver,
    findFirstEnglishAuctionOrThrow: actionResolvers.FindFirstEnglishAuctionOrThrowResolver,
    englishAuctions: actionResolvers.FindManyEnglishAuctionResolver,
    englishAuction: actionResolvers.FindUniqueEnglishAuctionResolver,
    getEnglishAuction: actionResolvers.FindUniqueEnglishAuctionOrThrowResolver,
    groupByEnglishAuction: actionResolvers.GroupByEnglishAuctionResolver,
    updateManyEnglishAuction: actionResolvers.UpdateManyEnglishAuctionResolver,
    updateOneEnglishAuction: actionResolvers.UpdateOneEnglishAuctionResolver,
    upsertOneEnglishAuction: actionResolvers.UpsertOneEnglishAuctionResolver
  },
  DutchAuction: {
    aggregateDutchAuction: actionResolvers.AggregateDutchAuctionResolver,
    createManyDutchAuction: actionResolvers.CreateManyDutchAuctionResolver,
    createManyAndReturnDutchAuction: actionResolvers.CreateManyAndReturnDutchAuctionResolver,
    createOneDutchAuction: actionResolvers.CreateOneDutchAuctionResolver,
    deleteManyDutchAuction: actionResolvers.DeleteManyDutchAuctionResolver,
    deleteOneDutchAuction: actionResolvers.DeleteOneDutchAuctionResolver,
    findFirstDutchAuction: actionResolvers.FindFirstDutchAuctionResolver,
    findFirstDutchAuctionOrThrow: actionResolvers.FindFirstDutchAuctionOrThrowResolver,
    dutchAuctions: actionResolvers.FindManyDutchAuctionResolver,
    dutchAuction: actionResolvers.FindUniqueDutchAuctionResolver,
    getDutchAuction: actionResolvers.FindUniqueDutchAuctionOrThrowResolver,
    groupByDutchAuction: actionResolvers.GroupByDutchAuctionResolver,
    updateManyDutchAuction: actionResolvers.UpdateManyDutchAuctionResolver,
    updateOneDutchAuction: actionResolvers.UpdateOneDutchAuctionResolver,
    upsertOneDutchAuction: actionResolvers.UpsertOneDutchAuctionResolver
  }
};
const crudResolversInfo = {
  Block: ["aggregateBlock", "createManyBlock", "createManyAndReturnBlock", "createOneBlock", "deleteManyBlock", "deleteOneBlock", "findFirstBlock", "findFirstBlockOrThrow", "blocks", "block", "getBlock", "groupByBlock", "updateManyBlock", "updateOneBlock", "upsertOneBlock"],
  Balance: ["aggregateBalance", "createManyBalance", "createManyAndReturnBalance", "createOneBalance", "deleteManyBalance", "deleteOneBalance", "findFirstBalance", "findFirstBalanceOrThrow", "balances", "balance", "getBalance", "groupByBalance", "updateManyBalance", "updateOneBalance", "upsertOneBalance"],
  NftCollection: ["aggregateNftCollection", "createManyNftCollection", "createManyAndReturnNftCollection", "createOneNftCollection", "deleteManyNftCollection", "deleteOneNftCollection", "findFirstNftCollection", "findFirstNftCollectionOrThrow", "nftCollections", "nftCollection", "getNftCollection", "groupByNftCollection", "updateManyNftCollection", "updateOneNftCollection", "upsertOneNftCollection"],
  Nft: ["aggregateNft", "createManyNft", "createManyAndReturnNft", "createOneNft", "deleteManyNft", "deleteOneNft", "findFirstNft", "findFirstNftOrThrow", "nfts", "nft", "getNft", "groupByNft", "updateManyNft", "updateOneNft", "upsertOneNft"],
  Bid: ["aggregateBid", "createManyBid", "createManyAndReturnBid", "createOneBid", "deleteManyBid", "deleteOneBid", "findFirstBid", "findFirstBidOrThrow", "bids", "bid", "getBid", "groupByBid", "updateManyBid", "updateOneBid", "upsertOneBid"],
  EnglishAuction: ["aggregateEnglishAuction", "createManyEnglishAuction", "createManyAndReturnEnglishAuction", "createOneEnglishAuction", "deleteManyEnglishAuction", "deleteOneEnglishAuction", "findFirstEnglishAuction", "findFirstEnglishAuctionOrThrow", "englishAuctions", "englishAuction", "getEnglishAuction", "groupByEnglishAuction", "updateManyEnglishAuction", "updateOneEnglishAuction", "upsertOneEnglishAuction"],
  DutchAuction: ["aggregateDutchAuction", "createManyDutchAuction", "createManyAndReturnDutchAuction", "createOneDutchAuction", "deleteManyDutchAuction", "deleteOneDutchAuction", "findFirstDutchAuction", "findFirstDutchAuctionOrThrow", "dutchAuctions", "dutchAuction", "getDutchAuction", "groupByDutchAuction", "updateManyDutchAuction", "updateOneDutchAuction", "upsertOneDutchAuction"]
};
const argsInfo = {
  AggregateBlockArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyBlockArgs: ["data", "skipDuplicates"],
  CreateManyAndReturnBlockArgs: ["data", "skipDuplicates"],
  CreateOneBlockArgs: ["data"],
  DeleteManyBlockArgs: ["where"],
  DeleteOneBlockArgs: ["where"],
  FindFirstBlockArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstBlockOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyBlockArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueBlockArgs: ["where"],
  FindUniqueBlockOrThrowArgs: ["where"],
  GroupByBlockArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyBlockArgs: ["data", "where"],
  UpdateOneBlockArgs: ["data", "where"],
  UpsertOneBlockArgs: ["where", "create", "update"],
  AggregateBalanceArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyBalanceArgs: ["data", "skipDuplicates"],
  CreateManyAndReturnBalanceArgs: ["data", "skipDuplicates"],
  CreateOneBalanceArgs: ["data"],
  DeleteManyBalanceArgs: ["where"],
  DeleteOneBalanceArgs: ["where"],
  FindFirstBalanceArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstBalanceOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyBalanceArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueBalanceArgs: ["where"],
  FindUniqueBalanceOrThrowArgs: ["where"],
  GroupByBalanceArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyBalanceArgs: ["data", "where"],
  UpdateOneBalanceArgs: ["data", "where"],
  UpsertOneBalanceArgs: ["where", "create", "update"],
  AggregateNftCollectionArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyNftCollectionArgs: ["data", "skipDuplicates"],
  CreateManyAndReturnNftCollectionArgs: ["data", "skipDuplicates"],
  CreateOneNftCollectionArgs: ["data"],
  DeleteManyNftCollectionArgs: ["where"],
  DeleteOneNftCollectionArgs: ["where"],
  FindFirstNftCollectionArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstNftCollectionOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyNftCollectionArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueNftCollectionArgs: ["where"],
  FindUniqueNftCollectionOrThrowArgs: ["where"],
  GroupByNftCollectionArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyNftCollectionArgs: ["data", "where"],
  UpdateOneNftCollectionArgs: ["data", "where"],
  UpsertOneNftCollectionArgs: ["where", "create", "update"],
  AggregateNftArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyNftArgs: ["data", "skipDuplicates"],
  CreateManyAndReturnNftArgs: ["data", "skipDuplicates"],
  CreateOneNftArgs: ["data"],
  DeleteManyNftArgs: ["where"],
  DeleteOneNftArgs: ["where"],
  FindFirstNftArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstNftOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyNftArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueNftArgs: ["where"],
  FindUniqueNftOrThrowArgs: ["where"],
  GroupByNftArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyNftArgs: ["data", "where"],
  UpdateOneNftArgs: ["data", "where"],
  UpsertOneNftArgs: ["where", "create", "update"],
  AggregateBidArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyBidArgs: ["data", "skipDuplicates"],
  CreateManyAndReturnBidArgs: ["data", "skipDuplicates"],
  CreateOneBidArgs: ["data"],
  DeleteManyBidArgs: ["where"],
  DeleteOneBidArgs: ["where"],
  FindFirstBidArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstBidOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyBidArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueBidArgs: ["where"],
  FindUniqueBidOrThrowArgs: ["where"],
  GroupByBidArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyBidArgs: ["data", "where"],
  UpdateOneBidArgs: ["data", "where"],
  UpsertOneBidArgs: ["where", "create", "update"],
  AggregateEnglishAuctionArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyEnglishAuctionArgs: ["data", "skipDuplicates"],
  CreateManyAndReturnEnglishAuctionArgs: ["data", "skipDuplicates"],
  CreateOneEnglishAuctionArgs: ["data"],
  DeleteManyEnglishAuctionArgs: ["where"],
  DeleteOneEnglishAuctionArgs: ["where"],
  FindFirstEnglishAuctionArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstEnglishAuctionOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyEnglishAuctionArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueEnglishAuctionArgs: ["where"],
  FindUniqueEnglishAuctionOrThrowArgs: ["where"],
  GroupByEnglishAuctionArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyEnglishAuctionArgs: ["data", "where"],
  UpdateOneEnglishAuctionArgs: ["data", "where"],
  UpsertOneEnglishAuctionArgs: ["where", "create", "update"],
  AggregateDutchAuctionArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyDutchAuctionArgs: ["data", "skipDuplicates"],
  CreateManyAndReturnDutchAuctionArgs: ["data", "skipDuplicates"],
  CreateOneDutchAuctionArgs: ["data"],
  DeleteManyDutchAuctionArgs: ["where"],
  DeleteOneDutchAuctionArgs: ["where"],
  FindFirstDutchAuctionArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstDutchAuctionOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyDutchAuctionArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueDutchAuctionArgs: ["where"],
  FindUniqueDutchAuctionOrThrowArgs: ["where"],
  GroupByDutchAuctionArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyDutchAuctionArgs: ["data", "where"],
  UpdateOneDutchAuctionArgs: ["data", "where"],
  UpsertOneDutchAuctionArgs: ["where", "create", "update"]
};

type ResolverModelNames = keyof typeof crudResolversMap;

type ModelResolverActionNames<
  TModel extends ResolverModelNames
> = keyof typeof crudResolversMap[TModel]["prototype"];

export type ResolverActionsConfig<
  TModel extends ResolverModelNames
> = Partial<Record<ModelResolverActionNames<TModel>, MethodDecorator[] | MethodDecoratorOverrideFn>>
  & {
    _all?: MethodDecorator[];
    _query?: MethodDecorator[];
    _mutation?: MethodDecorator[];
  };

export type ResolversEnhanceMap = {
  [TModel in ResolverModelNames]?: ResolverActionsConfig<TModel>;
};

export function applyResolversEnhanceMap(
  resolversEnhanceMap: ResolversEnhanceMap,
) {
  const mutationOperationPrefixes = [
    "createOne", "createMany", "createManyAndReturn", "deleteOne", "updateOne", "deleteMany", "updateMany", "upsertOne"
  ];
  for (const resolversEnhanceMapKey of Object.keys(resolversEnhanceMap)) {
    const modelName = resolversEnhanceMapKey as keyof typeof resolversEnhanceMap;
    const crudTarget = crudResolversMap[modelName].prototype;
    const resolverActionsConfig = resolversEnhanceMap[modelName]!;
    const actionResolversConfig = actionResolversMap[modelName];
    const allActionsDecorators = resolverActionsConfig._all;
    const resolverActionNames = crudResolversInfo[modelName as keyof typeof crudResolversInfo];
    for (const resolverActionName of resolverActionNames) {
      const maybeDecoratorsOrFn = resolverActionsConfig[
        resolverActionName as keyof typeof resolverActionsConfig
      ] as MethodDecorator[] | MethodDecoratorOverrideFn | undefined;
      const isWriteOperation = mutationOperationPrefixes.some(prefix => resolverActionName.startsWith(prefix));
      const operationKindDecorators = isWriteOperation ? resolverActionsConfig._mutation : resolverActionsConfig._query;
      const mainDecorators = [
        ...allActionsDecorators ?? [],
        ...operationKindDecorators ?? [],
      ]
      let decorators: MethodDecorator[];
      if (typeof maybeDecoratorsOrFn === "function") {
        decorators = maybeDecoratorsOrFn(mainDecorators);
      } else {
        decorators = [...mainDecorators, ...maybeDecoratorsOrFn ?? []];
      }
      const actionTarget = (actionResolversConfig[
        resolverActionName as keyof typeof actionResolversConfig
      ] as Function).prototype;
      tslib.__decorate(decorators, crudTarget, resolverActionName, null);
      tslib.__decorate(decorators, actionTarget, resolverActionName, null);
    }
  }
}

type ArgsTypesNames = keyof typeof argsTypes;

type ArgFieldNames<TArgsType extends ArgsTypesNames> = Exclude<
  keyof typeof argsTypes[TArgsType]["prototype"],
  number | symbol
>;

type ArgFieldsConfig<
  TArgsType extends ArgsTypesNames
> = FieldsConfig<ArgFieldNames<TArgsType>>;

export type ArgConfig<TArgsType extends ArgsTypesNames> = {
  class?: ClassDecorator[];
  fields?: ArgFieldsConfig<TArgsType>;
};

export type ArgsTypesEnhanceMap = {
  [TArgsType in ArgsTypesNames]?: ArgConfig<TArgsType>;
};

export function applyArgsTypesEnhanceMap(
  argsTypesEnhanceMap: ArgsTypesEnhanceMap,
) {
  for (const argsTypesEnhanceMapKey of Object.keys(argsTypesEnhanceMap)) {
    const argsTypeName = argsTypesEnhanceMapKey as keyof typeof argsTypesEnhanceMap;
    const typeConfig = argsTypesEnhanceMap[argsTypeName]!;
    const typeClass = argsTypes[argsTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      argsInfo[argsTypeName as keyof typeof argsInfo],
    );
  }
}

const relationResolversMap = {
  NftCollection: relationResolvers.NftCollectionRelationsResolver,
  Nft: relationResolvers.NftRelationsResolver,
  Bid: relationResolvers.BidRelationsResolver,
  EnglishAuction: relationResolvers.EnglishAuctionRelationsResolver,
  DutchAuction: relationResolvers.DutchAuctionRelationsResolver
};
const relationResolversInfo = {
  NftCollection: ["nfts"],
  Nft: ["collection", "englishAuctions", "dutchAuctions"],
  Bid: ["auction"],
  EnglishAuction: ["nft", "bids"],
  DutchAuction: ["nft"]
};

type RelationResolverModelNames = keyof typeof relationResolversMap;

type RelationResolverActionNames<
  TModel extends RelationResolverModelNames
> = keyof typeof relationResolversMap[TModel]["prototype"];

export type RelationResolverActionsConfig<TModel extends RelationResolverModelNames>
  = Partial<Record<RelationResolverActionNames<TModel>, MethodDecorator[] | MethodDecoratorOverrideFn>>
  & { _all?: MethodDecorator[] };

export type RelationResolversEnhanceMap = {
  [TModel in RelationResolverModelNames]?: RelationResolverActionsConfig<TModel>;
};

export function applyRelationResolversEnhanceMap(
  relationResolversEnhanceMap: RelationResolversEnhanceMap,
) {
  for (const relationResolversEnhanceMapKey of Object.keys(relationResolversEnhanceMap)) {
    const modelName = relationResolversEnhanceMapKey as keyof typeof relationResolversEnhanceMap;
    const relationResolverTarget = relationResolversMap[modelName].prototype;
    const relationResolverActionsConfig = relationResolversEnhanceMap[modelName]!;
    const allActionsDecorators = relationResolverActionsConfig._all ?? [];
    const relationResolverActionNames = relationResolversInfo[modelName as keyof typeof relationResolversInfo];
    for (const relationResolverActionName of relationResolverActionNames) {
      const maybeDecoratorsOrFn = relationResolverActionsConfig[
        relationResolverActionName as keyof typeof relationResolverActionsConfig
      ] as MethodDecorator[] | MethodDecoratorOverrideFn | undefined;
      let decorators: MethodDecorator[];
      if (typeof maybeDecoratorsOrFn === "function") {
        decorators = maybeDecoratorsOrFn(allActionsDecorators);
      } else {
        decorators = [...allActionsDecorators, ...maybeDecoratorsOrFn ?? []];
      }
      tslib.__decorate(decorators, relationResolverTarget, relationResolverActionName, null);
    }
  }
}

type TypeConfig = {
  class?: ClassDecorator[];
  fields?: FieldsConfig;
};

export type PropertyDecoratorOverrideFn = (decorators: PropertyDecorator[]) => PropertyDecorator[];

type FieldsConfig<TTypeKeys extends string = string> = Partial<
  Record<TTypeKeys, PropertyDecorator[] | PropertyDecoratorOverrideFn>
> & { _all?: PropertyDecorator[] };

function applyTypeClassEnhanceConfig<
  TEnhanceConfig extends TypeConfig,
  TType extends object
>(
  enhanceConfig: TEnhanceConfig,
  typeClass: ClassType<TType>,
  typePrototype: TType,
  typeFieldNames: string[]
) {
  if (enhanceConfig.class) {
    tslib.__decorate(enhanceConfig.class, typeClass);
  }
  if (enhanceConfig.fields) {
    const allFieldsDecorators = enhanceConfig.fields._all ?? [];
    for (const typeFieldName of typeFieldNames) {
      const maybeDecoratorsOrFn = enhanceConfig.fields[
        typeFieldName
      ] as PropertyDecorator[] | PropertyDecoratorOverrideFn | undefined;
      let decorators: PropertyDecorator[];
      if (typeof maybeDecoratorsOrFn === "function") {
        decorators = maybeDecoratorsOrFn(allFieldsDecorators);
      } else {
        decorators = [...allFieldsDecorators, ...maybeDecoratorsOrFn ?? []];
      }
      tslib.__decorate(decorators, typePrototype, typeFieldName, void 0);
    }
  }
}

const modelsInfo = {
  Block: ["height"],
  Balance: ["height", "address", "amount"],
  NftCollection: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  Nft: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  Bid: ["id", "bidder", "amount", "timestamp", "auctionId"],
  EnglishAuction: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  DutchAuction: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"]
};

type ModelNames = keyof typeof models;

type ModelFieldNames<TModel extends ModelNames> = Exclude<
  keyof typeof models[TModel]["prototype"],
  number | symbol
>;

type ModelFieldsConfig<TModel extends ModelNames> = FieldsConfig<
  ModelFieldNames<TModel>
>;

export type ModelConfig<TModel extends ModelNames> = {
  class?: ClassDecorator[];
  fields?: ModelFieldsConfig<TModel>;
};

export type ModelsEnhanceMap = {
  [TModel in ModelNames]?: ModelConfig<TModel>;
};

export function applyModelsEnhanceMap(modelsEnhanceMap: ModelsEnhanceMap) {
  for (const modelsEnhanceMapKey of Object.keys(modelsEnhanceMap)) {
    const modelName = modelsEnhanceMapKey as keyof typeof modelsEnhanceMap;
    const modelConfig = modelsEnhanceMap[modelName]!;
    const modelClass = models[modelName];
    const modelTarget = modelClass.prototype;
    applyTypeClassEnhanceConfig(
      modelConfig,
      modelClass,
      modelTarget,
      modelsInfo[modelName as keyof typeof modelsInfo],
    );
  }
}

const outputsInfo = {
  AggregateBlock: ["_count", "_avg", "_sum", "_min", "_max"],
  BlockGroupBy: ["height", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateBalance: ["_count", "_avg", "_sum", "_min", "_max"],
  BalanceGroupBy: ["height", "address", "amount", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateNftCollection: ["_count", "_avg", "_sum", "_min", "_max"],
  NftCollectionGroupBy: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateNft: ["_count", "_avg", "_sum", "_min", "_max"],
  NftGroupBy: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateBid: ["_count", "_avg", "_sum", "_min", "_max"],
  BidGroupBy: ["id", "bidder", "amount", "timestamp", "auctionId", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateEnglishAuction: ["_count", "_avg", "_sum", "_min", "_max"],
  EnglishAuctionGroupBy: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "_count", "_avg", "_sum", "_min", "_max"],
  AggregateDutchAuction: ["_count", "_avg", "_sum", "_min", "_max"],
  DutchAuctionGroupBy: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "_count", "_avg", "_sum", "_min", "_max"],
  AffectedRowsOutput: ["count"],
  BlockCountAggregate: ["height", "_all"],
  BlockAvgAggregate: ["height"],
  BlockSumAggregate: ["height"],
  BlockMinAggregate: ["height"],
  BlockMaxAggregate: ["height"],
  BalanceCountAggregate: ["height", "address", "amount", "_all"],
  BalanceAvgAggregate: ["height"],
  BalanceSumAggregate: ["height"],
  BalanceMinAggregate: ["height", "address", "amount"],
  BalanceMaxAggregate: ["height", "address", "amount"],
  NftCollectionCount: ["nfts"],
  NftCollectionCountAggregate: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume", "_all"],
  NftCollectionAvgAggregate: ["nftCount", "liveAuctionCount"],
  NftCollectionSumAggregate: ["nftCount", "liveAuctionCount"],
  NftCollectionMinAggregate: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftCollectionMaxAggregate: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftCount: ["englishAuctions", "dutchAuctions"],
  NftCountAggregate: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "_all"],
  NftAvgAggregate: ["id"],
  NftSumAggregate: ["id"],
  NftMinAggregate: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  NftMaxAggregate: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  BidCountAggregate: ["id", "bidder", "amount", "timestamp", "auctionId", "_all"],
  BidAvgAggregate: ["id"],
  BidSumAggregate: ["id"],
  BidMinAggregate: ["id", "bidder", "amount", "timestamp", "auctionId"],
  BidMaxAggregate: ["id", "bidder", "amount", "timestamp", "auctionId"],
  EnglishAuctionCount: ["bids"],
  EnglishAuctionCountAggregate: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "_all"],
  EnglishAuctionAvgAggregate: ["nftId", "startTime", "endTime"],
  EnglishAuctionSumAggregate: ["nftId", "startTime", "endTime"],
  EnglishAuctionMinAggregate: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  EnglishAuctionMaxAggregate: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  DutchAuctionCountAggregate: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "_all"],
  DutchAuctionAvgAggregate: ["nftId", "startTime", "endTime"],
  DutchAuctionSumAggregate: ["nftId", "startTime", "endTime"],
  DutchAuctionMinAggregate: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  DutchAuctionMaxAggregate: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  CreateManyAndReturnBlock: ["height"],
  CreateManyAndReturnBalance: ["height", "address", "amount"],
  CreateManyAndReturnNftCollection: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  CreateManyAndReturnNft: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection"],
  CreateManyAndReturnBid: ["id", "bidder", "amount", "timestamp", "auctionId", "auction"],
  CreateManyAndReturnEnglishAuction: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "nft"],
  CreateManyAndReturnDutchAuction: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "nft"]
};

type OutputTypesNames = keyof typeof outputTypes;

type OutputTypeFieldNames<TOutput extends OutputTypesNames> = Exclude<
  keyof typeof outputTypes[TOutput]["prototype"],
  number | symbol
>;

type OutputTypeFieldsConfig<
  TOutput extends OutputTypesNames
> = FieldsConfig<OutputTypeFieldNames<TOutput>>;

export type OutputTypeConfig<TOutput extends OutputTypesNames> = {
  class?: ClassDecorator[];
  fields?: OutputTypeFieldsConfig<TOutput>;
};

export type OutputTypesEnhanceMap = {
  [TOutput in OutputTypesNames]?: OutputTypeConfig<TOutput>;
};

export function applyOutputTypesEnhanceMap(
  outputTypesEnhanceMap: OutputTypesEnhanceMap,
) {
  for (const outputTypeEnhanceMapKey of Object.keys(outputTypesEnhanceMap)) {
    const outputTypeName = outputTypeEnhanceMapKey as keyof typeof outputTypesEnhanceMap;
    const typeConfig = outputTypesEnhanceMap[outputTypeName]!;
    const typeClass = outputTypes[outputTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      outputsInfo[outputTypeName as keyof typeof outputsInfo],
    );
  }
}

const inputsInfo = {
  BlockWhereInput: ["AND", "OR", "NOT", "height"],
  BlockOrderByWithRelationInput: ["height"],
  BlockWhereUniqueInput: ["height", "AND", "OR", "NOT"],
  BlockOrderByWithAggregationInput: ["height", "_count", "_avg", "_max", "_min", "_sum"],
  BlockScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "height"],
  BalanceWhereInput: ["AND", "OR", "NOT", "height", "address", "amount"],
  BalanceOrderByWithRelationInput: ["height", "address", "amount"],
  BalanceWhereUniqueInput: ["height_address", "AND", "OR", "NOT", "height", "address", "amount"],
  BalanceOrderByWithAggregationInput: ["height", "address", "amount", "_count", "_avg", "_max", "_min", "_sum"],
  BalanceScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "height", "address", "amount"],
  NftCollectionWhereInput: ["AND", "OR", "NOT", "address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume", "nfts"],
  NftCollectionOrderByWithRelationInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume", "nfts"],
  NftCollectionWhereUniqueInput: ["address", "AND", "OR", "NOT", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume", "nfts"],
  NftCollectionOrderByWithAggregationInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume", "_count", "_avg", "_max", "_min", "_sum"],
  NftCollectionScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftWhereInput: ["AND", "OR", "NOT", "id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "englishAuctions", "dutchAuctions"],
  NftOrderByWithRelationInput: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "englishAuctions", "dutchAuctions"],
  NftWhereUniqueInput: ["collectionAddress_id", "AND", "OR", "NOT", "id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "englishAuctions", "dutchAuctions"],
  NftOrderByWithAggregationInput: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "_count", "_avg", "_max", "_min", "_sum"],
  NftScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  BidWhereInput: ["AND", "OR", "NOT", "id", "bidder", "amount", "timestamp", "auctionId", "auction"],
  BidOrderByWithRelationInput: ["id", "bidder", "amount", "timestamp", "auctionId", "auction"],
  BidWhereUniqueInput: ["id", "AND", "OR", "NOT", "bidder", "amount", "timestamp", "auctionId", "auction"],
  BidOrderByWithAggregationInput: ["id", "bidder", "amount", "timestamp", "auctionId", "_count", "_avg", "_max", "_min", "_sum"],
  BidScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "bidder", "amount", "timestamp", "auctionId"],
  EnglishAuctionWhereInput: ["AND", "OR", "NOT", "id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "nft", "bids"],
  EnglishAuctionOrderByWithRelationInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "nft", "bids"],
  EnglishAuctionWhereUniqueInput: ["id", "AND", "OR", "NOT", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "nft", "bids"],
  EnglishAuctionOrderByWithAggregationInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "_count", "_avg", "_max", "_min", "_sum"],
  EnglishAuctionScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  DutchAuctionWhereInput: ["AND", "OR", "NOT", "id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "nft"],
  DutchAuctionOrderByWithRelationInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "nft"],
  DutchAuctionWhereUniqueInput: ["id", "AND", "OR", "NOT", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "nft"],
  DutchAuctionOrderByWithAggregationInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "_count", "_avg", "_max", "_min", "_sum"],
  DutchAuctionScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  BlockCreateInput: ["height"],
  BlockUpdateInput: ["height"],
  BlockCreateManyInput: ["height"],
  BlockUpdateManyMutationInput: ["height"],
  BalanceCreateInput: ["height", "address", "amount"],
  BalanceUpdateInput: ["height", "address", "amount"],
  BalanceCreateManyInput: ["height", "address", "amount"],
  BalanceUpdateManyMutationInput: ["height", "address", "amount"],
  NftCollectionCreateInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume", "nfts"],
  NftCollectionUpdateInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume", "nfts"],
  NftCollectionCreateManyInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftCollectionUpdateManyMutationInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftCreateInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "englishAuctions", "dutchAuctions"],
  NftUpdateInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "englishAuctions", "dutchAuctions"],
  NftCreateManyInput: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  NftUpdateManyMutationInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  BidCreateInput: ["bidder", "amount", "timestamp", "auction"],
  BidUpdateInput: ["bidder", "amount", "timestamp", "auction"],
  BidCreateManyInput: ["id", "bidder", "amount", "timestamp", "auctionId"],
  BidUpdateManyMutationInput: ["bidder", "amount", "timestamp"],
  EnglishAuctionCreateInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "nft", "bids"],
  EnglishAuctionUpdateInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "nft", "bids"],
  EnglishAuctionCreateManyInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  EnglishAuctionUpdateManyMutationInput: ["id", "creator", "winner", "ended", "startTime", "endTime"],
  DutchAuctionCreateInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "nft"],
  DutchAuctionUpdateInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice", "nft"],
  DutchAuctionCreateManyInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  DutchAuctionUpdateManyMutationInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  IntFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  BlockCountOrderByAggregateInput: ["height"],
  BlockAvgOrderByAggregateInput: ["height"],
  BlockMaxOrderByAggregateInput: ["height"],
  BlockMinOrderByAggregateInput: ["height"],
  BlockSumOrderByAggregateInput: ["height"],
  IntWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  StringFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not"],
  BalanceHeightAddressCompoundUniqueInput: ["height", "address"],
  BalanceCountOrderByAggregateInput: ["height", "address", "amount"],
  BalanceAvgOrderByAggregateInput: ["height"],
  BalanceMaxOrderByAggregateInput: ["height", "address", "amount"],
  BalanceMinOrderByAggregateInput: ["height", "address", "amount"],
  BalanceSumOrderByAggregateInput: ["height"],
  StringWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not", "_count", "_min", "_max"],
  StringNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not"],
  NftListRelationFilter: ["every", "some", "none"],
  SortOrderInput: ["sort", "nulls"],
  NftOrderByRelationAggregateInput: ["_count"],
  NftCollectionCountOrderByAggregateInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftCollectionAvgOrderByAggregateInput: ["nftCount", "liveAuctionCount"],
  NftCollectionMaxOrderByAggregateInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftCollectionMinOrderByAggregateInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftCollectionSumOrderByAggregateInput: ["nftCount", "liveAuctionCount"],
  StringNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not", "_count", "_min", "_max"],
  BoolFilter: ["equals", "not"],
  EnumAuctionTypeNullableFilter: ["equals", "in", "notIn", "not"],
  NftCollectionRelationFilter: ["is", "isNot"],
  EnglishAuctionListRelationFilter: ["every", "some", "none"],
  DutchAuctionListRelationFilter: ["every", "some", "none"],
  EnglishAuctionOrderByRelationAggregateInput: ["_count"],
  DutchAuctionOrderByRelationAggregateInput: ["_count"],
  nftCollectionAddressIdCompoundUniqueInput: ["collectionAddress", "id"],
  NftCountOrderByAggregateInput: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  NftAvgOrderByAggregateInput: ["id"],
  NftMaxOrderByAggregateInput: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  NftMinOrderByAggregateInput: ["id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  NftSumOrderByAggregateInput: ["id"],
  BoolWithAggregatesFilter: ["equals", "not", "_count", "_min", "_max"],
  EnumAuctionTypeNullableWithAggregatesFilter: ["equals", "in", "notIn", "not", "_count", "_min", "_max"],
  DateTimeFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  EnglishAuctionRelationFilter: ["is", "isNot"],
  BidCountOrderByAggregateInput: ["id", "bidder", "amount", "timestamp", "auctionId"],
  BidAvgOrderByAggregateInput: ["id"],
  BidMaxOrderByAggregateInput: ["id", "bidder", "amount", "timestamp", "auctionId"],
  BidMinOrderByAggregateInput: ["id", "bidder", "amount", "timestamp", "auctionId"],
  BidSumOrderByAggregateInput: ["id"],
  DateTimeWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  IntNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NftRelationFilter: ["is", "isNot"],
  BidListRelationFilter: ["every", "some", "none"],
  BidOrderByRelationAggregateInput: ["_count"],
  EnglishAuctionCountOrderByAggregateInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  EnglishAuctionAvgOrderByAggregateInput: ["nftId", "startTime", "endTime"],
  EnglishAuctionMaxOrderByAggregateInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  EnglishAuctionMinOrderByAggregateInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  EnglishAuctionSumOrderByAggregateInput: ["nftId", "startTime", "endTime"],
  IntNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  DutchAuctionCountOrderByAggregateInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  DutchAuctionAvgOrderByAggregateInput: ["nftId", "startTime", "endTime"],
  DutchAuctionMaxOrderByAggregateInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  DutchAuctionMinOrderByAggregateInput: ["id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  DutchAuctionSumOrderByAggregateInput: ["nftId", "startTime", "endTime"],
  IntFieldUpdateOperationsInput: ["set", "increment", "decrement", "multiply", "divide"],
  StringFieldUpdateOperationsInput: ["set"],
  NftCreateNestedManyWithoutCollectionInput: ["create", "connectOrCreate", "createMany", "connect"],
  NullableStringFieldUpdateOperationsInput: ["set"],
  NftUpdateManyWithoutCollectionNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  NftCollectionCreateNestedOneWithoutNftsInput: ["create", "connectOrCreate", "connect"],
  EnglishAuctionCreateNestedManyWithoutNftInput: ["create", "connectOrCreate", "createMany", "connect"],
  DutchAuctionCreateNestedManyWithoutNftInput: ["create", "connectOrCreate", "createMany", "connect"],
  BoolFieldUpdateOperationsInput: ["set"],
  NullableEnumAuctionTypeFieldUpdateOperationsInput: ["set"],
  NftCollectionUpdateOneRequiredWithoutNftsNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  EnglishAuctionUpdateManyWithoutNftNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  DutchAuctionUpdateManyWithoutNftNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  EnglishAuctionCreateNestedOneWithoutBidsInput: ["create", "connectOrCreate", "connect"],
  DateTimeFieldUpdateOperationsInput: ["set"],
  EnglishAuctionUpdateOneRequiredWithoutBidsNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  NftCreateNestedOneWithoutEnglishAuctionsInput: ["create", "connectOrCreate", "connect"],
  BidCreateNestedManyWithoutAuctionInput: ["create", "connectOrCreate", "createMany", "connect"],
  NullableIntFieldUpdateOperationsInput: ["set", "increment", "decrement", "multiply", "divide"],
  NftUpdateOneRequiredWithoutEnglishAuctionsNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  BidUpdateManyWithoutAuctionNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  NftCreateNestedOneWithoutDutchAuctionsInput: ["create", "connectOrCreate", "connect"],
  NftUpdateOneRequiredWithoutDutchAuctionsNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  NestedIntFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedIntWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  NestedFloatFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedStringFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not"],
  NestedStringWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not", "_count", "_min", "_max"],
  NestedStringNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not"],
  NestedStringNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not", "_count", "_min", "_max"],
  NestedIntNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedBoolFilter: ["equals", "not"],
  NestedEnumAuctionTypeNullableFilter: ["equals", "in", "notIn", "not"],
  NestedBoolWithAggregatesFilter: ["equals", "not", "_count", "_min", "_max"],
  NestedEnumAuctionTypeNullableWithAggregatesFilter: ["equals", "in", "notIn", "not", "_count", "_min", "_max"],
  NestedDateTimeFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedDateTimeWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  NestedIntNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  NestedFloatNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NftCreateWithoutCollectionInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "englishAuctions", "dutchAuctions"],
  NftCreateOrConnectWithoutCollectionInput: ["where", "create"],
  NftCreateManyCollectionInputEnvelope: ["data", "skipDuplicates"],
  NftUpsertWithWhereUniqueWithoutCollectionInput: ["where", "update", "create"],
  NftUpdateWithWhereUniqueWithoutCollectionInput: ["where", "data"],
  NftUpdateManyWithWhereWithoutCollectionInput: ["where", "data"],
  NftScalarWhereInput: ["AND", "OR", "NOT", "id", "collectionAddress", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  NftCollectionCreateWithoutNftsInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  NftCollectionCreateOrConnectWithoutNftsInput: ["where", "create"],
  EnglishAuctionCreateWithoutNftInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "bids"],
  EnglishAuctionCreateOrConnectWithoutNftInput: ["where", "create"],
  EnglishAuctionCreateManyNftInputEnvelope: ["data", "skipDuplicates"],
  DutchAuctionCreateWithoutNftInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  DutchAuctionCreateOrConnectWithoutNftInput: ["where", "create"],
  DutchAuctionCreateManyNftInputEnvelope: ["data", "skipDuplicates"],
  NftCollectionUpsertWithoutNftsInput: ["update", "create", "where"],
  NftCollectionUpdateToOneWithWhereWithoutNftsInput: ["where", "data"],
  NftCollectionUpdateWithoutNftsInput: ["address", "name", "description", "nftCount", "liveAuctionCount", "floorPrice", "volume"],
  EnglishAuctionUpsertWithWhereUniqueWithoutNftInput: ["where", "update", "create"],
  EnglishAuctionUpdateWithWhereUniqueWithoutNftInput: ["where", "data"],
  EnglishAuctionUpdateManyWithWhereWithoutNftInput: ["where", "data"],
  EnglishAuctionScalarWhereInput: ["AND", "OR", "NOT", "id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime"],
  DutchAuctionUpsertWithWhereUniqueWithoutNftInput: ["where", "update", "create"],
  DutchAuctionUpdateWithWhereUniqueWithoutNftInput: ["where", "data"],
  DutchAuctionUpdateManyWithWhereWithoutNftInput: ["where", "data"],
  DutchAuctionScalarWhereInput: ["AND", "OR", "NOT", "id", "nftCollection", "nftId", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  EnglishAuctionCreateWithoutBidsInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "nft"],
  EnglishAuctionCreateOrConnectWithoutBidsInput: ["where", "create"],
  EnglishAuctionUpsertWithoutBidsInput: ["update", "create", "where"],
  EnglishAuctionUpdateToOneWithWhereWithoutBidsInput: ["where", "data"],
  EnglishAuctionUpdateWithoutBidsInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "nft"],
  NftCreateWithoutEnglishAuctionsInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "dutchAuctions"],
  NftCreateOrConnectWithoutEnglishAuctionsInput: ["where", "create"],
  BidCreateWithoutAuctionInput: ["bidder", "amount", "timestamp"],
  BidCreateOrConnectWithoutAuctionInput: ["where", "create"],
  BidCreateManyAuctionInputEnvelope: ["data", "skipDuplicates"],
  NftUpsertWithoutEnglishAuctionsInput: ["update", "create", "where"],
  NftUpdateToOneWithWhereWithoutEnglishAuctionsInput: ["where", "data"],
  NftUpdateWithoutEnglishAuctionsInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "dutchAuctions"],
  BidUpsertWithWhereUniqueWithoutAuctionInput: ["where", "update", "create"],
  BidUpdateWithWhereUniqueWithoutAuctionInput: ["where", "data"],
  BidUpdateManyWithWhereWithoutAuctionInput: ["where", "data"],
  BidScalarWhereInput: ["AND", "OR", "NOT", "id", "bidder", "amount", "timestamp", "auctionId"],
  NftCreateWithoutDutchAuctionsInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "englishAuctions"],
  NftCreateOrConnectWithoutDutchAuctionsInput: ["where", "create"],
  NftUpsertWithoutDutchAuctionsInput: ["update", "create", "where"],
  NftUpdateToOneWithWhereWithoutDutchAuctionsInput: ["where", "data"],
  NftUpdateWithoutDutchAuctionsInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "collection", "englishAuctions"],
  NftCreateManyCollectionInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType"],
  NftUpdateWithoutCollectionInput: ["id", "owner", "locked", "metadata", "data", "name", "imgUrl", "lastAuctionId", "lastAuctionType", "englishAuctions", "dutchAuctions"],
  EnglishAuctionCreateManyNftInput: ["id", "creator", "winner", "ended", "startTime", "endTime"],
  DutchAuctionCreateManyNftInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  EnglishAuctionUpdateWithoutNftInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "bids"],
  DutchAuctionUpdateWithoutNftInput: ["id", "creator", "winner", "ended", "startTime", "endTime", "startPrice", "minPrice", "decayRate", "finalPrice"],
  BidCreateManyAuctionInput: ["id", "bidder", "amount", "timestamp"],
  BidUpdateWithoutAuctionInput: ["bidder", "amount", "timestamp"]
};

type InputTypesNames = keyof typeof inputTypes;

type InputTypeFieldNames<TInput extends InputTypesNames> = Exclude<
  keyof typeof inputTypes[TInput]["prototype"],
  number | symbol
>;

type InputTypeFieldsConfig<
  TInput extends InputTypesNames
> = FieldsConfig<InputTypeFieldNames<TInput>>;

export type InputTypeConfig<TInput extends InputTypesNames> = {
  class?: ClassDecorator[];
  fields?: InputTypeFieldsConfig<TInput>;
};

export type InputTypesEnhanceMap = {
  [TInput in InputTypesNames]?: InputTypeConfig<TInput>;
};

export function applyInputTypesEnhanceMap(
  inputTypesEnhanceMap: InputTypesEnhanceMap,
) {
  for (const inputTypeEnhanceMapKey of Object.keys(inputTypesEnhanceMap)) {
    const inputTypeName = inputTypeEnhanceMapKey as keyof typeof inputTypesEnhanceMap;
    const typeConfig = inputTypesEnhanceMap[inputTypeName]!;
    const typeClass = inputTypes[inputTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      inputsInfo[inputTypeName as keyof typeof inputsInfo],
    );
  }
}

