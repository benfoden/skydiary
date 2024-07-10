-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "metadata" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "description" TEXT,
    "unitAmount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL,
    "trialPeriodDays" INTEGER,
    "metadata" TEXT NOT NULL,
    CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "cancelAt" DATETIME,
    "canceledAt" DATETIME,
    "trialStart" DATETIME,
    "trialEnd" DATETIME,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
