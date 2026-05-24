-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'CURADOR', 'CURADOR_PRO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'CURATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('MITICO', 'EXCEPCIONAL', 'RARO', 'COMUN');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "MomentStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_AUCTION', 'IN_VAULT');

-- CreateEnum
CREATE TYPE "Era" AS ENUM ('PREHISTORIA', 'MUNDO_ANTIGUO', 'EDAD_MEDIA', 'RENACIMIENTO', 'ERA_INDUSTRIAL', 'ERA_ESPACIAL', 'ERA_DIGITAL');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CIENCIA', 'ARTE', 'GUERRA', 'POLITICA', 'EXPLORACION');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'OPEN', 'EXTENDING', 'CLOSED_WON', 'CLOSED_NO_BIDS', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('ACTIVE', 'OUTBID', 'WON', 'RELEASED', 'HOLD_FAILED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TxKind" AS ENUM ('AUCTION_WIN', 'SECONDARY_SALE', 'ROYALTY_PAYMENT');

-- CreateEnum
CREATE TYPE "PetitionStatus" AS ENUM ('IN_REVIEW', 'APPROVED_SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotifKind" AS ENUM ('AUCTION_WON', 'AUCTION_LOST', 'BID_OUTBID', 'AUCTION_EXTENDED', 'EARLY_ACCESS_GRANTED', 'PETITION_STATUS_CHANGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "displayName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moment" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "era" "Era" NOT NULL,
    "category" "Category" NOT NULL,
    "tier" "Tier" NOT NULL,
    "confidence" "Confidence" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "procedence" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "location" TEXT,
    "totalCirculation" INTEGER NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "status" "MomentStatus" NOT NULL DEFAULT 'DRAFT',
    "sources" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "petitionId" TEXT,

    CONSTRAINT "Moment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextEvent" (
    "id" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContextEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "startPrice" INTEGER NOT NULL,
    "currentBidId" TEXT,
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "opensAt" TIMESTAMP(3) NOT NULL,
    "baseClosesAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "earlyAccessUntil" TIMESTAMP(3),
    "earlyAccessUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeError" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'ACTIVE',
    "triggeredExtension" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ownership" (
    "id" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acquisitionPrice" INTEGER NOT NULL,
    "originalAdquirentId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Ownership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "ownershipId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "askingPrice" INTEGER NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "kind" "TxKind" NOT NULL,
    "momentId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT,
    "grossAmount" INTEGER NOT NULL,
    "cronosFee" INTEGER NOT NULL,
    "sellerNet" INTEGER NOT NULL,
    "royaltyAmount" INTEGER NOT NULL,
    "royaltyRecipientId" TEXT,
    "stripeChargeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Petition" (
    "id" TEXT NOT NULL,
    "proposerId" TEXT NOT NULL,
    "proposedYear" INTEGER NOT NULL,
    "proposedTitle" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "sources" TEXT[],
    "status" "PetitionStatus" NOT NULL DEFAULT 'IN_REVIEW',
    "adminNotes" TEXT,
    "qualityScore" INTEGER,
    "approvedMomentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Petition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetitionVote" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetitionVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "NotifKind" NOT NULL,
    "payload" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Moment_slug_key" ON "Moment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Moment_petitionId_key" ON "Moment"("petitionId");

-- CreateIndex
CREATE INDEX "Moment_year_idx" ON "Moment"("year");

-- CreateIndex
CREATE INDEX "Moment_tier_idx" ON "Moment"("tier");

-- CreateIndex
CREATE INDEX "Moment_era_idx" ON "Moment"("era");

-- CreateIndex
CREATE INDEX "Moment_status_idx" ON "Moment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_currentBidId_key" ON "Auction"("currentBidId");

-- CreateIndex
CREATE INDEX "Auction_status_idx" ON "Auction"("status");

-- CreateIndex
CREATE INDEX "Auction_closesAt_idx" ON "Auction"("closesAt");

-- CreateIndex
CREATE INDEX "Bid_auctionId_createdAt_idx" ON "Bid"("auctionId", "createdAt");

-- CreateIndex
CREATE INDEX "Bid_userId_idx" ON "Bid"("userId");

-- CreateIndex
CREATE INDEX "Ownership_userId_idx" ON "Ownership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ownership_momentId_serialNumber_key" ON "Ownership"("momentId", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_ownershipId_key" ON "Listing"("ownershipId");

-- CreateIndex
CREATE INDEX "Transaction_buyerId_idx" ON "Transaction"("buyerId");

-- CreateIndex
CREATE INDEX "Transaction_sellerId_idx" ON "Transaction"("sellerId");

-- CreateIndex
CREATE INDEX "Transaction_momentId_idx" ON "Transaction"("momentId");

-- CreateIndex
CREATE INDEX "Petition_status_idx" ON "Petition"("status");

-- CreateIndex
CREATE INDEX "Petition_createdAt_idx" ON "Petition"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PetitionVote_petitionId_userId_key" ON "PetitionVote"("petitionId", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_sentAt_idx" ON "Notification"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- AddForeignKey
ALTER TABLE "Moment" ADD CONSTRAINT "Moment_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextEvent" ADD CONSTRAINT "ContextEvent_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_currentBidId_fkey" FOREIGN KEY ("currentBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownershipId_fkey" FOREIGN KEY ("ownershipId") REFERENCES "Ownership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetitionVote" ADD CONSTRAINT "PetitionVote_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetitionVote" ADD CONSTRAINT "PetitionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
