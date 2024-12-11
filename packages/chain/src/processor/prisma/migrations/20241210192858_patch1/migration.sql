-- CreateEnum
CREATE TYPE "AuctionType" AS ENUM ('ENGLISH', 'DUTCH');

-- CreateTable
CREATE TABLE "nftCollection" (
    "address" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "nftCount" INTEGER NOT NULL DEFAULT 0,
    "liveAuctionCount" INTEGER NOT NULL DEFAULT 0,
    "floorPrice" TEXT,
    "volume" TEXT,

    CONSTRAINT "nftCollection_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "nft" (
    "id" INTEGER NOT NULL,
    "collectionAddress" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "metadata" TEXT NOT NULL,
    "data" TEXT,
    "name" TEXT,
    "imgUrl" TEXT,
    "lastAuctionId" TEXT,
    "lastAuctionType" "AuctionType",

    CONSTRAINT "nft_pkey" PRIMARY KEY ("collectionAddress","id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" SERIAL NOT NULL,
    "bidder" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auctionId" TEXT NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishAuction" (
    "id" TEXT NOT NULL,
    "nftCollection" TEXT NOT NULL,
    "nftId" INTEGER NOT NULL,
    "creator" TEXT NOT NULL,
    "winner" TEXT,
    "ended" BOOLEAN NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER,

    CONSTRAINT "EnglishAuction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutchAuction" (
    "id" TEXT NOT NULL,
    "nftCollection" TEXT NOT NULL,
    "nftId" INTEGER NOT NULL,
    "creator" TEXT NOT NULL,
    "winner" TEXT,
    "ended" BOOLEAN NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER,
    "startPrice" TEXT NOT NULL,
    "minPrice" TEXT NOT NULL,
    "decayRate" TEXT NOT NULL,
    "finalPrice" TEXT,

    CONSTRAINT "DutchAuction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nft_owner_idx" ON "nft"("owner");

-- CreateIndex
CREATE INDEX "Bid_auctionId_idx" ON "Bid"("auctionId");

-- CreateIndex
CREATE INDEX "EnglishAuction_nftCollection_nftId_idx" ON "EnglishAuction"("nftCollection", "nftId");

-- CreateIndex
CREATE INDEX "DutchAuction_nftCollection_nftId_idx" ON "DutchAuction"("nftCollection", "nftId");

-- AddForeignKey
ALTER TABLE "nft" ADD CONSTRAINT "nft_collectionAddress_fkey" FOREIGN KEY ("collectionAddress") REFERENCES "nftCollection"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "EnglishAuction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnglishAuction" ADD CONSTRAINT "EnglishAuction_nftCollection_nftId_fkey" FOREIGN KEY ("nftCollection", "nftId") REFERENCES "nft"("collectionAddress", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutchAuction" ADD CONSTRAINT "DutchAuction_nftCollection_nftId_fkey" FOREIGN KEY ("nftCollection", "nftId") REFERENCES "nft"("collectionAddress", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
